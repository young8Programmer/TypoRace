'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { io, Socket } from 'socket.io-client'
import RaceVisualization from '@/components/RaceVisualization'
import TypingArea from '@/components/TypingArea'
import RaceStats from '@/components/RaceStats'

interface Player {
  userId: string
  username: string
  progress: number
  wpm: number
  accuracy: number
  position: number
  finished: boolean
}

interface Room {
  id: string
  name: string
  status: string
  players: Player[]
  text: string
  startedAt?: string
}

export default function RacePage() {
  const { user, isAuthenticated, init } = useAuthStore()
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [raceStarted, setRaceStarted] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [raceFinished, setRaceFinished] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    init()
    if (!isAuthenticated || !user) {
      router.push('/')
      return
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      newSocket.emit('join_matchmaking', {
        userId: user.id,
        username: user.username,
      })
    })

    newSocket.on('room_update', (roomData: Room) => {
      setRoom(roomData)
    })

    newSocket.on('countdown', (num: number) => {
      setCountdown(num)
    })

    newSocket.on('race_started', (data: { text: string; startedAt: string }) => {
      setRaceStarted(true)
      setCountdown(null)
      setRoom((prev) => prev ? { ...prev, text: data.text, startedAt: data.startedAt } : null)
    })

    newSocket.on('progress_update', (data: any) => {
      setRoom((prev) => {
        if (!prev) return prev
        const updatedPlayers = prev.players.map((p) =>
          p.userId === data.userId
            ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy, position: data.position }
            : p
        )
        return { ...prev, players: updatedPlayers }
      })
    })

    newSocket.on('player_finished', (data: any) => {
      setRoom((prev) => {
        if (!prev) return prev
        const updatedPlayers = prev.players.map((p) =>
          p.userId === data.userId
            ? { ...p, finished: true, wpm: data.wpm, accuracy: data.accuracy, position: data.position }
            : p
        )
        return { ...prev, players: updatedPlayers }
      })
    })

    newSocket.on('race_finished', (data: any) => {
      setRaceFinished(true)
      setResults(data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [isAuthenticated, user, router, init])

  const handleTyping = (text: string) => {
    if (!raceStarted || raceFinished || !room || !socket) return

    setTypedText(text)
    setCurrentIndex(text.length)

    socket.emit('typing_progress', {
      roomId: room.id,
      userId: user?.id,
      typedText: text,
      currentCharIndex: text.length,
    })
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {countdown !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-9xl font-bold text-white">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {raceFinished && results && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-3xl font-bold text-center mb-6">Race Finished!</h2>
              <div className="space-y-4">
                {results.results
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((result: any, index: number) => (
                    <div
                      key={result.userId}
                      className={`p-4 rounded-lg ${
                        result.userId === results.winner
                          ? 'bg-yellow-100 border-2 border-yellow-400'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold mr-2">#{result.position}</span>
                          <span className="text-xl font-semibold">{result.username}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{result.wpm.toFixed(0)} WPM</div>
                          <div className="text-sm text-gray-600">{result.accuracy.toFixed(1)}% accuracy</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6">Typing Race</h1>
          
          {room && (
            <>
              <RaceVisualization players={room.players} currentUserId={user.id} />
              
              {raceStarted && room.text && (
                <>
                  <TypingArea
                    text={room.text}
                    onTyping={handleTyping}
                    disabled={raceFinished}
                  />
                  <RaceStats
                    players={room.players}
                    currentUserId={user.id}
                  />
                </>
              )}

              {!raceStarted && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 mb-4">
                    Waiting for players... ({room.players.length}/{room.maxPlayers || 3})
                  </p>
                  <div className="space-y-2">
                    {room.players.map((player) => (
                      <div key={player.userId} className="text-gray-700">
                        {player.username}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
