'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/lib/UserContext'

type User = {
  id: string
  name: string
}

export default function UserSelector() {
  const { userId, userName, setUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    // Show modal if no user selected
    if (!userId && users.length > 0) {
      setShowModal(true)
    }
  }, [userId, users])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    }
  }

  const handleUserSelect = (user: User) => {
    setUser(user.id, user.name)
    setShowModal(false)
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Select User</h2>
          <p className="text-gray-600 mb-6">Who is tracking today?</p>
          {users.length > 0 ? (
            <div className="space-y-4">
              <select
                onChange={(e) => {
                  const user = users.find((u) => u.id === e.target.value)
                  if (user) handleUserSelect(user)
                }}
                className="w-full border rounded-lg px-4 py-3 text-lg"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a user
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-red-600">No users found. Please check the database.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Tracking as:</span>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
      >
        {userName}
      </button>
    </div>
  )
}
