'use client'

import { useState, useEffect } from 'react'

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        // Check for updates periodically
        setInterval(() => {
          reg.update()
        }, 60000) // Check every minute

        // Listen for new service worker waiting
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        <p className="font-semibold">Update Available!</p>
        <p className="text-sm">A new version of the app is ready.</p>
        <button
          onClick={handleUpdate}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50"
        >
          Update Now
        </button>
      </div>
    </div>
  )
}
