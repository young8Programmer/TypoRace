'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { LogOut, Trophy, User, Zap } from 'lucide-react'

export default function Dashboard() {
  const { user, isAuthenticated, logout, init } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router, init])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">TypoRace</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.username}</span>
              <button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to race? Find your match and start typing!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/race"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-12 w-12 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-gray-800">Race</span>
            </div>
            <p className="text-gray-600">
              Join a real-time typing race with other players
            </p>
          </Link>

          <Link
            href="/leaderboard"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <Trophy className="h-12 w-12 text-yellow-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-gray-800">Leaderboard</span>
            </div>
            <p className="text-gray-600">
              See top players and your ranking
            </p>
          </Link>

          <Link
            href="/profile"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <User className="h-12 w-12 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-gray-800">Profile</span>
            </div>
            <p className="text-gray-600">
              View your stats and achievements
            </p>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-600">Best WPM</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">Average WPM</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-600">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">-</div>
              <div className="text-sm text-gray-600">Wins</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
