'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/UserContext'
import { fetchWithAuth } from '@/lib/api'

type Consumable = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: number
}

type FoodEntry = {
  id: string
  date: string
  amount: number
  name: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  consumable: Consumable | null
}

export default function TrackPage() {
  const { userId } = useUser()
  const [consumables, setConsumables] = useState<Consumable[]>([])
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showManualForm, setShowManualForm] = useState(false)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [showAIForm, setShowAIForm] = useState(false)

  const [manualFormData, setManualFormData] = useState({
    name: '',
    amount: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const [inventoryFormData, setInventoryFormData] = useState({
    consumableId: '',
    amount: '',
    unit: 'grams' as 'grams' | 'servings',
  })

  const [aiFormData, setAIFormData] = useState({
    description: '',
    image: null as File | null,
  })

  const [aiLoading, setAILoading] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchConsumables()
      fetchEntries()
    }
  }, [date, userId])

  const fetchConsumables = async () => {
    try {
      const res = await fetch('/api/consumables', {
        headers: { 'x-user-id': userId || '' },
      })
      const data = await res.json()
      setConsumables(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch consumables:', error)
    }
  }

  const fetchEntries = async () => {
    try {
      const res = await fetchWithAuth(`/api/food-entries?date=${date}`, userId)
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetchWithAuth('/api/food-entries', userId, {
        method: 'POST',
        body: JSON.stringify({
          date,
          ...manualFormData,
        }),
      })
      setManualFormData({ name: '', amount: '', calories: '', protein: '', carbs: '', fat: '' })
      setShowManualForm(false)
      fetchEntries()
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const consumable = consumables.find((c) => c.id === inventoryFormData.consumableId)
    if (!consumable) return

    // Calculate amount in grams and ratio
    const amountInGrams = inventoryFormData.unit === 'servings'
      ? parseFloat(inventoryFormData.amount) * consumable.servingSize
      : parseFloat(inventoryFormData.amount)

    const ratio = amountInGrams / consumable.servingSize

    try {
      await fetchWithAuth('/api/food-entries', userId, {
        method: 'POST',
        body: JSON.stringify({
          date,
          consumableId: consumable.id,
          amount: amountInGrams,
          name: consumable.name,
          calories: consumable.calories * ratio,
          protein: consumable.protein * ratio,
          carbs: consumable.carbs * ratio,
          fat: consumable.fat * ratio,
        }),
      })
      setInventoryFormData({ consumableId: '', amount: '', unit: 'grams' })
      setShowInventoryForm(false)
      fetchEntries()
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAILoading(true)

    try {
      let imageBase64 = ''
      if (aiFormData.image) {
        const reader = new FileReader()
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
          }
          reader.readAsDataURL(aiFormData.image!)
        }) as string
      }

      const analysisRes = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          description: aiFormData.description,
        }),
      })

      if (!analysisRes.ok) {
        const errorData = await analysisRes.json()
        throw new Error(errorData.error || 'Failed to analyze food')
      }

      const nutritionData = await analysisRes.json()

      // Validate nutrition data
      if (!nutritionData.name || nutritionData.calories === undefined) {
        throw new Error('AI returned incomplete data. Please try again or enter manually.')
      }

      await fetchWithAuth('/api/food-entries', userId, {
        method: 'POST',
        body: JSON.stringify({
          date,
          amount: nutritionData.servingSize || 100,
          name: nutritionData.name,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat,
        }),
      })

      setAIFormData({ description: '', image: null })
      setShowAIForm(false)
      fetchEntries()
    } catch (error) {
      console.error('AI analysis failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze food'
      alert(`${errorMessage}\n\nPlease try again with a clearer description/image, or use manual entry.`)
    } finally {
      setAILoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAuth(`/api/food-entries/${id}`, userId, {
        method: 'DELETE',
      })
      fetchEntries()
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const handleDuplicate = async (entry: FoodEntry) => {
    try {
      await fetchWithAuth('/api/food-entries', userId, {
        method: 'POST',
        body: JSON.stringify({
          date,
          consumableId: entry.consumable?.id,
          amount: entry.amount,
          name: entry.name,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
        }),
      })
      fetchEntries()
    } catch (error) {
      console.error('Failed to duplicate entry:', error)
      alert('Failed to duplicate entry. Please try again.')
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Track Food</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 shadow-sm text-sm"
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Today's Total</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{totals.calories.toFixed(0)}</p>
              <p className="text-gray-600 text-sm">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.protein.toFixed(1)}g</p>
              <p className="text-gray-600 text-sm">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.carbs.toFixed(1)}g</p>
              <p className="text-gray-600 text-sm">Carbs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.fat.toFixed(1)}g</p>
              <p className="text-gray-600 text-sm">Fat</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => {
              setShowInventoryForm(!showInventoryForm)
              setShowManualForm(false)
              setShowAIForm(false)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            From Inventory
          </button>
          <button
            onClick={() => {
              setShowManualForm(!showManualForm)
              setShowInventoryForm(false)
              setShowAIForm(false)
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto"
          >
            Manual Entry
          </button>
          <button
            onClick={() => {
              setShowAIForm(!showAIForm)
              setShowManualForm(false)
              setShowInventoryForm(false)
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full sm:w-auto"
          >
            AI Analyze
          </button>
        </div>

        {showInventoryForm && (
          <form onSubmit={handleInventorySubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Add from Inventory</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Food</label>
                <select
                  required
                  value={inventoryFormData.consumableId}
                  onChange={(e) =>
                    setInventoryFormData({ ...inventoryFormData, consumableId: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Choose a food</option>
                  {consumables.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.servingSize}g)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select
                  value={inventoryFormData.unit}
                  onChange={(e) =>
                    setInventoryFormData({ ...inventoryFormData, unit: e.target.value as 'grams' | 'servings' })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="grams">Grams</option>
                  <option value="servings">Servings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount ({inventoryFormData.unit === 'grams' ? 'g' : 'servings'})
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={inventoryFormData.amount}
                  onChange={(e) =>
                    setInventoryFormData({ ...inventoryFormData, amount: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Add Entry
            </button>
          </form>
        )}

        {showManualForm && (
          <form onSubmit={handleManualSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={manualFormData.name}
                  onChange={(e) => setManualFormData({ ...manualFormData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (g)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={manualFormData.amount}
                  onChange={(e) => setManualFormData({ ...manualFormData, amount: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={manualFormData.calories}
                  onChange={(e) =>
                    setManualFormData({ ...manualFormData, calories: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Protein (g)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={manualFormData.protein}
                  onChange={(e) =>
                    setManualFormData({ ...manualFormData, protein: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={manualFormData.carbs}
                  onChange={(e) => setManualFormData({ ...manualFormData, carbs: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fat (g)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={manualFormData.fat}
                  onChange={(e) => setManualFormData({ ...manualFormData, fat: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Add Entry
            </button>
          </form>
        )}

        {showAIForm && (
          <form onSubmit={handleAISubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">AI Food Analysis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (e.g., "2 slices of bread with peanut butter")
                </label>
                <textarea
                  required
                  rows={4}
                  value={aiFormData.description}
                  onChange={(e) => setAIFormData({ ...aiFormData, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe what you're eating..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAIFormData({ ...aiFormData, image: e.target.files?.[0] || null })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {aiLoading ? 'Analyzing...' : 'Analyze & Add'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Today's Entries</h2>
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-semibold">
                    {entry.consumable?.name || entry.name} - {entry.amount}g
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                    <span>{entry.calories.toFixed(0)} cal</span>
                    <span>{entry.protein.toFixed(1)}g protein</span>
                    <span>{entry.carbs.toFixed(1)}g carbs</span>
                    <span>{entry.fat.toFixed(1)}g fat</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDuplicate(entry)}
                    className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
