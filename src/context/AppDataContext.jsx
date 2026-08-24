import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { loadGoals, saveGoals } from '../lib/localGoals.js'
import { loadCoachPlans, saveCoachPlans } from '../lib/localCoach.js'
import { useSessions } from '../hooks/useSessions.js'
import { makeId } from '../lib/storage.js'

// Goals + coach plans persist locally; sessions (workouts) are dual-mode
// (Supabase when configured) via useSessions and live in their own table,
// separate from plans.
const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const [goals, setGoals] = useState(() => loadGoals())
  const [coachPlans, setCoachPlans] = useState(() => loadCoachPlans())
  const { sessions, sessionsLoading, logSession, updateSession, removeSession } =
    useSessions()

  useEffect(() => {
    saveGoals(goals)
  }, [goals])

  useEffect(() => {
    saveCoachPlans(coachPlans)
  }, [coachPlans])

  const updateGoals = useCallback((updates) => {
    setGoals((prev) => ({ ...prev, ...updates }))
  }, [])

  // Coach: custom plans created for a specific athlete.
  const getCoachPlans = useCallback(
    (athleteId) => coachPlans[athleteId] ?? [],
    [coachPlans],
  )

  const addCoachPlan = useCallback((athleteId, plan) => {
    const created = { ...plan, id: makeId() }
    setCoachPlans((prev) => ({
      ...prev,
      [athleteId]: [created, ...(prev[athleteId] ?? [])],
    }))
    return created
  }, [])

  const value = {
    goals,
    updateGoals,
    sessions,
    sessionsLoading,
    logSession,
    updateSession,
    removeSession,
    getCoachPlans,
    addCoachPlan,
  }
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}
