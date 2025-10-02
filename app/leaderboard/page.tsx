'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/UserContext'

type LeaderboardEntry = {
  userId: string
  userName: string
  totals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  goal: {
    calories: number
    protein: number
    carbs: number
    fat: number
  } | null
  goalPercentage: {
    calories: number
    protein: number
    carbs: number
    fat: number
  } | null
  averageGoalPercentage: number
  entriesCount: number
}

export default function LeaderboardPage() {
  const { userId } = useUser()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [date])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?date=${date}`)
      const data = await res.json()
      setLeaderboard(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'text-green-600'
    if (percentage > 110) return 'text-red-600'
    return 'text-yellow-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">🏆 Leaderboard</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 shadow-sm text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">No data available for this date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl ${
                  entry.userId === userId ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold min-w-[60px]">
                      {getMedalEmoji(index)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        {entry.userName}
                        {entry.userId === userId && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {entry.entriesCount} {entry.entriesCount === 1 ? 'entry' : 'entries'} logged
                      </p>
                    </div>
                  </div>

                  {entry.goal ? (
                    <div className="flex-1 max-w-md">
                      <div className="text-right mb-2">
                        <span className={`text-2xl font-bold ${getProgressColor(entry.averageGoalPercentage)}`}>
                          {entry.averageGoalPercentage.toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-600 ml-2">goal completion</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Calories:</span>
                          <span className={`ml-2 font-semibold ${getProgressColor(entry.goalPercentage!.calories)}`}>
                            {entry.totals.calories.toFixed(0)}/{entry.goal.calories}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Protein:</span>
                          <span className={`ml-2 font-semibold ${getProgressColor(entry.goalPercentage!.protein)}`}>
                            {entry.totals.protein.toFixed(1)}g/{entry.goal.protein}g
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Carbs:</span>
                          <span className={`ml-2 font-semibold ${getProgressColor(entry.goalPercentage!.carbs)}`}>
                            {entry.totals.carbs.toFixed(1)}g/{entry.goal.carbs}g
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Fat:</span>
                          <span className={`ml-2 font-semibold ${getProgressColor(entry.goalPercentage!.fat)}`}>
                            {entry.totals.fat.toFixed(1)}g/{entry.goal.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No goal set</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
