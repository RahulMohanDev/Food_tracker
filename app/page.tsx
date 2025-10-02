'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/UserContext'
import { fetchWithAuth } from '@/lib/api'

type DailyGoal = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

type FoodEntry = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function Home() {
  const { userId } = useUser()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [goal, setGoal] = useState<DailyGoal | null>(null)
  const [entries, setEntries] = useState<FoodEntry[]>([])

  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [date, userId])

  const fetchData = async () => {
    try {
      const [goalRes, entriesRes] = await Promise.all([
        fetchWithAuth(`/api/daily-goal?date=${date}`, userId),
        fetchWithAuth(`/api/food-entries?date=${date}`, userId),
      ])

      const goalData = await goalRes.json()
      const entriesData = await entriesRes.json()

      setGoal(goalData?.id ? goalData : null)
      setEntries(Array.isArray(entriesData) ? entriesData : [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setEntries([])
    }
  }

  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const getPercentage = (consumed: number, goal: number) => {
    return goal > 0 ? Math.round((consumed / goal) * 100) : 0
  }

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500'
    if (percentage > 90) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Macro Tracker</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 shadow-sm text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/track"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Track Food</h3>
            <p className="text-gray-600">Log your meals and snacks</p>
          </Link>

          <Link
            href="/consumables"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-green-600 mb-2">Food Inventory</h3>
            <p className="text-gray-600">Manage your food database</p>
          </Link>

          <Link
            href="/goals"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-purple-600 mb-2">Daily Goals</h3>
            <p className="text-gray-600">Set your macro targets</p>
          </Link>

          <Link
            href="/leaderboard"
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-pink-600 mb-2">🏆 Leaderboard</h3>
            <p className="text-gray-600">Compare with other users</p>
          </Link>
        </div>

        {goal ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Today's Progress</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Calories</span>
                  <span className="text-sm text-gray-600">
                    {getPercentage(totals.calories, goal.calories)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${getProgressColor(
                      getPercentage(totals.calories, goal.calories)
                    )}`}
                    style={{ width: `${Math.min(getPercentage(totals.calories, goal.calories), 100)}%` }}
                  ></div>
                </div>
                <p className="text-2xl font-bold">
                  {totals.calories.toFixed(0)} / {goal.calories}
                </p>
                <p className="text-sm text-gray-600">
                  {(goal.calories - totals.calories).toFixed(0)} remaining
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Protein</span>
                  <span className="text-sm text-gray-600">
                    {getPercentage(totals.protein, goal.protein)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${getProgressColor(
                      getPercentage(totals.protein, goal.protein)
                    )}`}
                    style={{ width: `${Math.min(getPercentage(totals.protein, goal.protein), 100)}%` }}
                  ></div>
                </div>
                <p className="text-2xl font-bold">
                  {totals.protein.toFixed(1)}g / {goal.protein}g
                </p>
                <p className="text-sm text-gray-600">
                  {(goal.protein - totals.protein).toFixed(1)}g remaining
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Carbs</span>
                  <span className="text-sm text-gray-600">
                    {getPercentage(totals.carbs, goal.carbs)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${getProgressColor(
                      getPercentage(totals.carbs, goal.carbs)
                    )}`}
                    style={{ width: `${Math.min(getPercentage(totals.carbs, goal.carbs), 100)}%` }}
                  ></div>
                </div>
                <p className="text-2xl font-bold">
                  {totals.carbs.toFixed(1)}g / {goal.carbs}g
                </p>
                <p className="text-sm text-gray-600">
                  {(goal.carbs - totals.carbs).toFixed(1)}g remaining
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Fat</span>
                  <span className="text-sm text-gray-600">
                    {getPercentage(totals.fat, goal.fat)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${getProgressColor(
                      getPercentage(totals.fat, goal.fat)
                    )}`}
                    style={{ width: `${Math.min(getPercentage(totals.fat, goal.fat), 100)}%` }}
                  ></div>
                </div>
                <p className="text-2xl font-bold">
                  {totals.fat.toFixed(1)}g / {goal.fat}g
                </p>
                <p className="text-sm text-gray-600">
                  {(goal.fat - totals.fat).toFixed(1)}g remaining
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No Goals Set</h2>
            <p className="text-gray-600 mb-6">Set your daily macro goals to see your progress</p>
            <Link
              href="/goals"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Set Goals
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
