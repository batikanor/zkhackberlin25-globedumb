import type { Database } from "@/lib/supabase"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface GameStatsProps {
  user: UserProfile
  currentPoints?: number
  distance?: number
}

export function GameStats({ user, currentPoints, distance }: GameStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Welcome, {user.username}!</h2>
          <p className="text-gray-600">
            {user.nationality && `From ${user.nationality} • `}
            Games played: {user.games_played}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{user.score.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Total Score</div>
        </div>
      </div>

      {currentPoints !== undefined && distance !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span>Last guess: {distance.toLocaleString()} km away</span>
            <span className="font-semibold text-green-600">+{currentPoints.toFixed(2)} points</span>
          </div>
        </div>
      )}
    </div>
  )
}
