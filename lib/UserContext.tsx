'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type UserContextType = {
  userId: string | null
  userName: string | null
  setUser: (id: string, name: string) => void
}

const UserContext = createContext<UserContextType>({
  userId: null,
  userName: null,
  setUser: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // Load user from localStorage
    const savedUserId = localStorage.getItem('userId')
    const savedUserName = localStorage.getItem('userName')
    if (savedUserId && savedUserName) {
      setUserId(savedUserId)
      setUserName(savedUserName)
    }
  }, [])

  const setUser = (id: string, name: string) => {
    setUserId(id)
    setUserName(name)
    localStorage.setItem('userId', id)
    localStorage.setItem('userName', name)
  }

  return (
    <UserContext.Provider value={{ userId, userName, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
