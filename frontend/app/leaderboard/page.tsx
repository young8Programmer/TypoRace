'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Trophy } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  wpm: number
  accuracy: number
  gamesPlayed: number
  wins: number
  rank: number
}

export default function LeaderboardPage() {
  const { isAuthenticated, init } = useAuthStore()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all_time')

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    fetchLeaderboard()
  }, [isAuthenticated, router, init, type])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/leaderboard?type=${type}&limit=100`)
      setLeaderboard(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600 mr-3" />
              Leaderboard
            </h1>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all_time">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading leaderboard...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Player</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">WPM</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Accuracy</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Games</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Wins</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index < 3 ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className="font-bold text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${entry.rank}`}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {entry.user.avatar && (
                            <img
                              src={entry.user.avatar}
                              alt={entry.user.username}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          )}
                          <span className="font-semibold">{entry.user.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-blue-600">
                        {entry.wpm.toFixed(0)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        {entry.accuracy.toFixed(1)}%
                      </td>
                      <td className="py-4 px-4 text-right text-gray-600">
                        {entry.gamesPlayed}
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-semibold">
                        {entry.wins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
