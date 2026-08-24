import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  localLoadPlans,
  localCreatePlan,
  localUpdatePlan,
  localDeletePlan,
} from '../lib/localPlans.js'

// Maps a Supabase row to the shape the UI works with.
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    exercises: row.exercises ?? [],
    schedule: row.schedule ?? [],
    createdAt: row.created_at,
  }
}

// Training plans. Backed by Supabase (scoped to the signed-in user via
// Row-Level Security) when configured, or by localStorage in developer mode.
export function useTrainingPlans() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setPlans([])
      setLoading(false)
      return
    }
    setLoading(true)
    if (!isSupabaseConfigured) {
      setPlans(localLoadPlans())
      setLoading(false)
      return
    }
    const { data, error: err } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err)
    else setPlans((data ?? []).map(fromRow))
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const getPlan = useCallback((id) => plans.find((p) => p.id === id), [plans])

  const createPlan = useCallback(async (plan) => {
    if (!isSupabaseConfigured) {
      const created = localCreatePlan(plan)
      setPlans((prev) => [created, ...prev])
      return created
    }
    const { data, error: err } = await supabase
      .from('plans')
      .insert({
        name: plan.name,
        exercises: plan.exercises,
        schedule: plan.schedule ?? [],
      })
      .select()
      .single()
    if (err) throw err
    const created = fromRow(data)
    setPlans((prev) => [created, ...prev])
    return created
  }, [])

  const updatePlan = useCallback(async (id, updates) => {
    if (!isSupabaseConfigured) {
      const updated = localUpdatePlan(id, updates)
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)))
      return updated
    }
    const { data, error: err } = await supabase
      .from('plans')
      .update({
        name: updates.name,
        exercises: updates.exercises,
        schedule: updates.schedule ?? [],
      })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const updated = fromRow(data)
    setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const deletePlan = useCallback(async (id) => {
    // Optimistic removal; restore on failure.
    const prev = plans
    setPlans((cur) => cur.filter((p) => p.id !== id))
    if (!isSupabaseConfigured) {
      localDeletePlan(id)
      return
    }
    const { error: err } = await supabase.from('plans').delete().eq('id', id)
    if (err) {
      setPlans(prev)
      throw err
    }
  }, [plans])

  return {
    plans,
    loading,
    error,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
    refresh,
  }
}
