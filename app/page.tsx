"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { supabase, type Database } from "@/lib/supabase"
import { getRandomTrivia, calculateDistance, calculatePoints } from "@/lib/trivia-locations"
import { GameStats } from "@/components/game-stats"
import { Leaderboards } from "@/components/leaderboards"
import ZKPassportAuth from "@/components/zkpassport-auth"

// Load react-globe.gl client-side only
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false })

type UserProfile = Database["public"]["Tables"]["users"]["Row"]
type TriviaLocation = { name: string; lat: number; lng: number; country: string; hint: string }

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLeaderboards, setShowLeaderboards] = useState(false)

  // Game state
  const [currentTarget, setCurrentTarget] = useState<TriviaLocation | null>(null)
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null)
  const [gameResult, setGameResult] = useState<{ distance: number; points: number } | null>(null)
  const [hasGuessed, setHasGuessed] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Markers for the globe
  const [markers, setMarkers] = useState<any[]>([])

  const handleVerificationResult = async (result: { success: boolean; proof?: any }) => {
    if (!result.success || !result.proof) {
      setError("Authentication failed")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting to save user:", result.proof)

      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: result.proof.userId,
          username: result.proof.username || "Anonymous",
          nationality: result.proof.nationality || null,
          year: result.proof.birthYear || null,
          score: 0,
          games_played: 0,
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase upsert error:", error)
        setError(`Failed to save user profile: ${error.message}`)
        return
      }

      console.log("User saved successfully:", data)
      setUser(data as UserProfile)
      startNewGame()
    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startNewGame = () => {
    const newTarget = getRandomTrivia()
    setCurrentTarget(newTarget)
    setUserGuess(null)
    setGameResult(null)
    setHasGuessed(false)
    setShowHint(false)
    setMarkers([])
  }

  const handleGlobeClick = (point: any) => {
    if (hasGuessed || !currentTarget) return

    const guess = { lat: point.lat, lng: point.lng }
    setUserGuess(guess)

    // Add guess marker to globe
    setMarkers([
      {
        lat: guess.lat,
        lng: guess.lng,
        size: 0.8,
        color: "blue",
        label: "Your Guess",
      },
    ])
  }

  const submitGuess = async () => {
    if (!userGuess || !currentTarget || !user) return

    setIsLoading(true)
    setError(null)

    try {
      const distance = calculateDistance(userGuess.lat, userGuess.lng, currentTarget.lat, currentTarget.lng)
      const points = calculatePoints(distance)

      console.log("Submitting guess:", {
        user_id: user.id,
        target_country: currentTarget.country,
        distance,
        points,
        userGuess,
        target: { lat: currentTarget.lat, lng: currentTarget.lng },
      })

      // Add target marker to show correct location
      setMarkers((prev) => [
        ...prev,
        {
          lat: currentTarget.lat,
          lng: currentTarget.lng,
          size: 1.0,
          color: "red",
          label: currentTarget.hint,
        },
      ])

      // Update user score first (this is more important than session tracking)
      const newScore = user.score + points
      const newGamesPlayed = user.games_played + 1

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          score: newScore,
          games_played: newGamesPlayed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        console.error("User update error:", updateError)
        setError(`Score update failed: ${updateError.message}`)
      } else {
        console.log("User updated:", updatedUser)
        setUser(updatedUser as UserProfile)
      }

      // Try to save game session (optional - don't fail if this doesn't work)
      try {
        const sessionData = {
          user_id: user.id,
          target_country: currentTarget.country,
          target_lat: Number(currentTarget.lat),
          target_lng: Number(currentTarget.lng),
          guess_lat: Number(userGuess.lat),
          guess_lng: Number(userGuess.lng),
          distance_km: distance,
          points_earned: points,
          completed_at: new Date().toISOString(),
        }

        console.log("Attempting to save session:", sessionData)

        const { data: savedSession, error: sessionError } = await supabase
          .from("game_sessions")
          .insert(sessionData)
          .select()
          .single()

        if (sessionError) {
          console.error("Session save error details:", sessionError)
          // Don't show error to user for session save failures
        } else {
          console.log("Game session saved successfully:", savedSession)
        }
      } catch (sessionErr) {
        console.error("Session save exception:", sessionErr)
        // Don't show error to user for session save failures
      }

      setGameResult({ distance, points })
      setHasGuessed(true)
    } catch (err) {
      console.error("Guess submission error:", err)
      setError("Failed to submit guess")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setGlobeReady(true)
  }, [])

  if (showLeaderboards) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Globe Trivia Leaderboards</h1>
            <p className="text-gray-600">See how players and countries rank worldwide</p>
            <button
              onClick={() => setShowLeaderboards(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Back to Game
            </button>
          </div>
          <Leaderboards />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌍 Globe Dumb</h1>
          <p className="text-gray-600">Are you or your nation globe-dumb?</p>
          {user && (
            <button
              onClick={() => setShowLeaderboards(true)}
              className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              🏆 View Leaderboards
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        {!user ? (
          <div className="text-center">
            <ZKPassportAuth onVerificationResult={handleVerificationResult} />
          </div>
        ) : (
          <>
            <GameStats user={user} currentPoints={gameResult?.points} distance={gameResult?.distance} />

            {currentTarget && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    📍 Find: <span className="text-blue-600">{currentTarget.name}</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Click on the globe where you think this is located!</p>

                  <div className="flex gap-2 justify-center mb-4">
                    <button
                      onClick={submitGuess}
                      disabled={!userGuess || hasGuessed || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Processing..." : hasGuessed ? "Guessed!" : "Make Guess"}
                    </button>

                    <button
                      onClick={() => setShowHint(!showHint)}
                      disabled={hasGuessed}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
                    >
                      💡 {showHint ? "Hide" : "Show"} Hint
                    </button>

                    <button
                      onClick={startNewGame}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      New Question
                    </button>
                  </div>

                  {showHint && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Hint:</strong> {currentTarget.hint}
                      </p>
                    </div>
                  )}

                  {hasGuessed && gameResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Answer:</strong> {currentTarget.hint}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        You were {gameResult.distance.toLocaleString()} km away and earned{" "}
                        {gameResult.points.toFixed(2)} points!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {globeReady && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="w-full h-[600px] flex justify-center items-center">
                  <div className="w-full max-w-4xl">
                    <Globe
                      globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
                      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                      pointsData={markers}
                      pointAltitude="size"
                      pointColor="color"
                      pointLabel="label"
                      onGlobeClick={handleGlobeClick}
                      enablePointerInteraction={!hasGuessed}
                      width={800}
                      height={600}
                    />
                  </div>
                </div>

                {userGuess && !hasGuessed && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Guess placed at: {userGuess.lat.toFixed(2)}°, {userGuess.lng.toFixed(2)}°
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
