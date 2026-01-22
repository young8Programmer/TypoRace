'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, User, Trophy, Zap } from 'lucide-react'

export default function ProfilePage() {
  const { user, isAuthenticated, init } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    fetchProfile()
  }, [isAuthenticated, router, init])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/me')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center space-x-6 mb-8">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-12 w-12 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading profile...</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.bestWPM?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Best WPM</div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">
                  {stats?.totalWins || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Wins</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.totalGames || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Games Played</div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats?.averageWPM?.toFixed(0) || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg WPM</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
