'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/UserContext'
import { fetchWithAuth } from '@/lib/api'

type DailyGoal = {
  id: string
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function GoalsPage() {
  const { userId } = useUser()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [goal, setGoal] = useState<DailyGoal | null>(null)
  const [formData, setFormData] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  useEffect(() => {
    if (userId) {
      fetchGoal()
    }
  }, [date, userId])

  const fetchGoal = async () => {
    try {
      const res = await fetchWithAuth(`/api/daily-goal?date=${date}`, userId)
      const data = await res.json()
      if (data && data.id) {
        setGoal(data)
        setFormData({
          calories: data.calories.toString(),
          protein: data.protein.toString(),
          carbs: data.carbs.toString(),
          fat: data.fat.toString(),
        })
      } else {
        setGoal(null)
        setFormData({ calories: '', protein: '', carbs: '', fat: '' })
      }
    } catch (error) {
      console.error('Failed to fetch goal:', error)
      setGoal(null)
      setFormData({ calories: '', protein: '', carbs: '', fat: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetchWithAuth('/api/daily-goal', userId, {
        method: 'POST',
        body: JSON.stringify({
          date,
          ...formData,
        }),
      })
      if (res.ok) {
        fetchGoal()
      }
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Goals</h1>
          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 shadow-sm text-sm"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {goal ? 'Update' : 'Set'} Daily Macro Goals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Calories</label>
              <input
                type="number"
                required
                step="1"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Protein (g)</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Carbs (g)</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fat (g)</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {goal ? 'Update' : 'Set'} Goals
          </button>
        </form>

        {goal && (
          <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Current Goals</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{goal.calories}</p>
                <p className="text-gray-600 text-sm">Calories</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{goal.protein}g</p>
                <p className="text-gray-600 text-sm">Protein</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{goal.carbs}g</p>
                <p className="text-gray-600 text-sm">Carbs</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{goal.fat}g</p>
                <p className="text-gray-600 text-sm">Fat</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
