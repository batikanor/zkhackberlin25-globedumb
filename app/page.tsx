"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useZKPassport } from "@/hooks/useZKPassport"
import { supabase, type Database } from "@/lib/supabase"
import { getRandomLocation, calculateDistance, calculatePoints } from "@/lib/countries"
import { GameStats } from "@/components/game-stats"
import { GameControls } from "@/components/game-controls"
import { DatabaseTest } from "@/components/database-test"

// Load react-globe.gl client-side only
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false })

type UserProfile = Database["public"]["Tables"]["users"]["Row"]
type GameLocation = { name: string; lat: number; lng: number; country: string }

export default function Home() {
  const zkPassport = useZKPassport()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [globeReady, setGlobeReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(true)

  // Game state
  const [currentTarget, setCurrentTarget] = useState<GameLocation | null>(null)
  const [userGuess, setUserGuess] = useState<{ lat: number; lng: number } | null>(null)
  const [gameResult, setGameResult] = useState<{ distance: number; points: number } | null>(null)
  const [hasGuessed, setHasGuessed] = useState(false)

  // Markers for the globe
  const [markers, setMarkers] = useState<any[]>([])

  const handleLogin = async () => {
    if (!zkPassport) {
      setError("ZKPassport not initialized")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const credential = await zkPassport.requestCredential({
        statement: "Sign in to play the Globe Game",
      })

      if (!credential) {
        setError("Authentication failed")
        return
      }

      console.log("Attempting to save user:", credential)

      const { data, error } = await supabase
        .from("users")
        .upsert({
          id: credential.userId,
          username: credential.username || "Anonymous",
          nationality: credential.nationality || null,
          year: credential.birthYear || null,
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
      setShowDebug(false)
      startNewGame()
    } catch (err) {
      console.error("Login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startNewGame = () => {
    const newTarget = getRandomLocation()
    setCurrentTarget(newTarget)
    setUserGuess(null)
    setGameResult(null)
    setHasGuessed(false)
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
      })

      // Add target marker to show correct location
      setMarkers((prev) => [
        ...prev,
        {
          lat: currentTarget.lat,
          lng: currentTarget.lng,
          size: 1.0,
          color: "red",
          label: currentTarget.name,
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌍 Globe Guess</h1>
          <p className="text-gray-600">Test your geography knowledge with ZKPassport authentication</p>
        </div>

        {showDebug && <DatabaseTest />}

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
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Welcome to Globe Guess!</h2>
              <p className="text-gray-600 mb-6">Sign in with ZKPassport to start playing and track your scores.</p>
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in with ZKPassport"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <GameStats user={user} currentPoints={gameResult?.points} distance={gameResult?.distance} />

            {currentTarget && (
              <GameControls
                targetLocation={currentTarget.name}
                onNewGame={startNewGame}
                onMakeGuess={submitGuess}
                hasGuessed={hasGuessed}
                isLoading={isLoading}
              />
            )}

            {globeReady && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="w-full h-[600px]">
                  <Globe
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-day.jpg"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    pointsData={markers}
                    pointAltitude="size"
                    pointColor="color"
                    pointLabel="label"
                    onGlobeClick={handleGlobeClick}
                    enablePointerInteraction={!hasGuessed}
                  />
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
