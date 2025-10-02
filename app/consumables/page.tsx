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

export default function ConsumablesPage() {
  const { userId } = useUser()
  const [consumables, setConsumables] = useState<Consumable[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showAIForm, setShowAIForm] = useState(false)
  const [aiLoading, setAILoading] = useState(false)
  const [labelImage, setLabelImage] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: '',
  })

  useEffect(() => {
    if (userId) {
      fetchConsumables()
    }
  }, [userId])

  const fetchConsumables = async () => {
    try {
      const res = await fetch('/api/consumables')
      const data = await res.json()
      setConsumables(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch consumables:', error)
      setConsumables([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/consumables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setFormData({
          name: '',
          calories: '',
          protein: '',
          carbs: '',
          fat: '',
          servingSize: '',
        })
        setShowForm(false)
        fetchConsumables()
      }
    } catch (error) {
      console.error('Failed to create consumable:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/consumables/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchConsumables()
      }
    } catch (error) {
      console.error('Failed to delete consumable:', error)
    }
  }

  const handleAnalyzeLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!labelImage) return

    setAILoading(true)

    try {
      const reader = new FileReader()
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.readAsDataURL(labelImage)
      })

      const analysisRes = await fetch('/api/analyze-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      })

      const nutritionData = await analysisRes.json()

      setFormData({
        name: nutritionData.name || '',
        calories: nutritionData.calories?.toString() || '',
        protein: nutritionData.protein?.toString() || '',
        carbs: nutritionData.carbs?.toString() || '',
        fat: nutritionData.fat?.toString() || '',
        servingSize: nutritionData.servingSize?.toString() || '',
      })

      setShowAIForm(false)
      setShowForm(true)
      setLabelImage(null)
    } catch (error) {
      console.error('Label analysis failed:', error)
      alert('Failed to analyze label. Please try again or enter manually.')
    } finally {
      setAILoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Food Inventory</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setShowAIForm(!showAIForm)
                setShowForm(false)
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full sm:w-auto"
            >
              {showAIForm ? 'Cancel' : 'Scan Label'}
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setShowAIForm(false)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
            >
              {showForm ? 'Cancel' : 'Add Manually'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Serving Size (g)</label>
                <input
                  type="number"
                  required
                  step="0.1"
                  value={formData.servingSize}
                  onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calories</label>
                <input
                  type="number"
                  required
                  step="0.1"
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
              <div className="sm:col-span-2">
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
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Add to Inventory
            </button>
          </form>
        )}

        {showAIForm && (
          <form onSubmit={handleAnalyzeLabel} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold mb-4">Scan Nutrition Label</h3>
            <p className="text-sm text-gray-600 mb-4">
              Take a picture of the nutrition label on your food product. GPT will extract the nutritional information for you.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Upload Label Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                  onChange={(e) => setLabelImage(e.target.files?.[0] || null)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              {labelImage && (
                <div className="text-sm text-green-600">
                  ✓ Image selected: {labelImage.name}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={aiLoading || !labelImage}
              className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {aiLoading ? 'Analyzing Label...' : 'Scan & Extract Info'}
            </button>
          </form>
        )}

        <div className="grid gap-4">
          {consumables.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Serving: {item.servingSize}g
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-700">
                      <strong>{item.calories}</strong> cal
                    </span>
                    <span className="text-gray-700">
                      <strong>{item.protein}g</strong> protein
                    </span>
                    <span className="text-gray-700">
                      <strong>{item.carbs}g</strong> carbs
                    </span>
                    <span className="text-gray-700">
                      <strong>{item.fat}g</strong> fat
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
