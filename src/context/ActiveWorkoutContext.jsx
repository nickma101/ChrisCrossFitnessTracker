import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Holds the single in-progress workout draft. It lives above the routes, so it
// survives tab navigation, and is mirrored to localStorage so it also survives
// a reload. Nothing is written to the database until the workout is finished.
const ActiveWorkoutContext = createContext(null)
const STORAGE_KEY = 'chriscross.activeWorkout'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function ActiveWorkoutProvider({ children }) {
  const [active, setActive] = useState(load)

  useEffect(() => {
    try {
      if (active) localStorage.setItem(STORAGE_KEY, JSON.stringify(active))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage failures
    }
  }, [active])

  const startWorkout = useCallback((draft) => {
    setActive({ ...draft, startedAt: Date.now() })
  }, [])

  // Apply an updater to the active draft (used for every edit).
  const patchWorkout = useCallback((updater) => {
    setActive((prev) => (prev ? updater(prev) : prev))
  }, [])

  const discardWorkout = useCallback(() => setActive(null), [])

  const value = { active, startWorkout, patchWorkout, discardWorkout }
  return (
    <ActiveWorkoutContext.Provider value={value}>
      {children}
    </ActiveWorkoutContext.Provider>
  )
}

export function useActiveWorkout() {
  const ctx = useContext(ActiveWorkoutContext)
  if (!ctx) throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider')
  return ctx
}
