'use client'

import { motion } from 'framer-motion'

interface Player {
  userId: string
  username: string
  progress: number
  wpm: number
  accuracy: number
  position: number
  finished: boolean
}

interface RaceVisualizationProps {
  players: Player[]
  currentUserId: string
}

export default function RaceVisualization({ players, currentUserId }: RaceVisualizationProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.finished && !b.finished) return -1
    if (!a.finished && b.finished) return 1
    return b.progress - a.progress
  })

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Race Progress</h2>
      <div className="space-y-4">
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.userId === currentUserId
          return (
            <div key={player.userId} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    #{player.position}
                  </span>
                  <span
                    className={`font-semibold ${
                      isCurrentUser ? 'text-blue-600' : 'text-gray-800'
                    }`}
                  >
                    {player.username}
                    {isCurrentUser && ' (You)'}
                  </span>
                  {player.finished && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Finished
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {player.wpm.toFixed(0)} WPM • {player.accuracy.toFixed(1)}%
                </div>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${player.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
                {player.finished && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
