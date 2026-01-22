'use client'

interface Player {
  userId: string
  username: string
  progress: number
  wpm: number
  accuracy: number
  position: number
  finished: boolean
}

interface RaceStatsProps {
  players: Player[]
  currentUserId: string
}

export default function RaceStats({ players, currentUserId }: RaceStatsProps) {
  const currentPlayer = players.find((p) => p.userId === currentUserId)

  if (!currentPlayer) return null

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">
          {currentPlayer.wpm.toFixed(0)}
        </div>
        <div className="text-sm text-gray-600">WPM</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-600">
          {currentPlayer.accuracy.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600">Accuracy</div>
      </div>
      <div className="bg-purple-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-purple-600">
          #{currentPlayer.position}
        </div>
        <div className="text-sm text-gray-600">Position</div>
      </div>
    </div>
  )
}
