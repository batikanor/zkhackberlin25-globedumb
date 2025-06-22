"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface LeaderboardUser {
  username: string
  nationality: string | null
  score: number
  games_played: number
}

interface CountryStats {
  nationality: string
  total_score: number
  total_players: number
  avg_score: number
}

export function Leaderboards() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([])
  const [countryTotals, setCountryTotals] = useState<CountryStats[]>([])
  const [countryAverages, setCountryAverages] = useState<CountryStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboards()
  }, [])

  const fetchLeaderboards = async () => {
    try {
      // Global leaderboard - top 10 players
      const { data: globalData, error: globalError } = await supabase
        .from("users")
        .select("username, nationality, score, games_played")
        .order("score", { ascending: false })
        .limit(10)

      if (globalError) throw globalError
      setGlobalLeaderboard(globalData || [])

      // Country totals - sum of all scores per country
      const { data: countryTotalData, error: countryTotalError } = await supabase
        .from("users")
        .select("nationality, score")
        .not("nationality", "is", null)

      if (countryTotalError) throw countryTotalError

      // Process country totals
      const countryTotalMap = new Map<string, { total: number; count: number }>()
      countryTotalData?.forEach((user) => {
        const country = user.nationality!
        const existing = countryTotalMap.get(country) || { total: 0, count: 0 }
        countryTotalMap.set(country, {
          total: existing.total + user.score,
          count: existing.count + 1,
        })
      })

      const countryTotalStats: CountryStats[] = Array.from(countryTotalMap.entries())
        .map(([nationality, stats]) => ({
          nationality,
          total_score: stats.total,
          total_players: stats.count,
          avg_score: Math.round(stats.total / stats.count),
        }))
        .sort((a, b) => b.total_score - a.total_score)

      setCountryTotals(countryTotalStats)

      // Country averages - same data but sorted by average
      const countryAvgStats = [...countryTotalStats].sort((a, b) => b.avg_score - a.avg_score)
      setCountryAverages(countryAvgStats)
    } catch (error) {
      console.error("Error fetching leaderboards:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCountryFlag = (nationality: string | null): string => {
    const flags: { [key: string]: string } = {
      Germany: "🇩🇪",
      "United States": "🇺🇸",
      Japan: "🇯🇵",
      France: "🇫🇷",
      "United Kingdom": "🇬🇧",
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      Italy: "🇮🇹",
      Spain: "🇪🇸",
      Brazil: "🇧🇷",
      Russia: "🇷🇺",
      China: "🇨🇳",
      India: "🇮🇳",
      Sweden: "🇸🇪",
      Norway: "🇳🇴",
      Netherlands: "🇳🇱",
      Switzerland: "🇨🇭",
      Austria: "🇦🇹",
      Poland: "🇵🇱",
      "Czech Republic": "🇨🇿",
      Hungary: "🇭🇺",
    }
    return flags[nationality || ""] || "🌍"
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Global Leaderboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">🏆 Top Players</h3>
        <div className="space-y-3">
          {globalLeaderboard.map((user, index) => (
            <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                <div>
                  <div className="font-semibold text-gray-800">{user.username}</div>
                  <div className="text-sm text-gray-600">
                    {getCountryFlag(user.nationality)} {user.nationality} • {user.games_played} games
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{user.score.toLocaleString()}</div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Totals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">🌍 Countries by Total Score</h3>
        <div className="space-y-3">
          {countryTotals.slice(0, 10).map((country, index) => (
            <div key={country.nationality} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                <div>
                  <div className="font-semibold text-gray-800">
                    {getCountryFlag(country.nationality)} {country.nationality}
                  </div>
                  <div className="text-sm text-gray-600">{country.total_players} players</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{country.total_score.toLocaleString()}</div>
                <div className="text-xs text-gray-500">total points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Averages */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">📊 Countries by Average Score</h3>
        <div className="space-y-3">
          {countryAverages.slice(0, 10).map((country, index) => (
            <div key={country.nationality} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                <div>
                  <div className="font-semibold text-gray-800">
                    {getCountryFlag(country.nationality)} {country.nationality}
                  </div>
                  <div className="text-sm text-gray-600">{country.total_players} players</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{country.avg_score.toLocaleString()}</div>
                <div className="text-xs text-gray-500">avg points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
