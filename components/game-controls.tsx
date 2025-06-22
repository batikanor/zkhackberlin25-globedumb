"use client"

interface GameControlsProps {
  targetLocation: string
  onNewGame: () => void
  onMakeGuess: () => void
  hasGuessed: boolean
  isLoading: boolean
}

export function GameControls({ targetLocation, onNewGame, onMakeGuess, hasGuessed, isLoading }: GameControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Find: <span className="text-blue-600">{targetLocation}</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">Click on the globe where you think this location is!</p>

        <div className="flex gap-2 justify-center">
          <button
            onClick={onMakeGuess}
            disabled={hasGuessed || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : hasGuessed ? "Guessed!" : "Make Guess"}
          </button>

          <button
            onClick={onNewGame}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  )
}
