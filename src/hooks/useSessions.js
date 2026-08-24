import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  loadSessions as localLoad,
  createSession as localCreate,
  updateSession as localUpdate,
  deleteSession as localDelete,
} from '../lib/localSessions.js'

const byNewest = (a, b) => b.performedAt - a.performedAt

function fromRow(row) {
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    performedAt: new Date(row.performed_at).getTime(),
    entries: row.entries ?? [],
  }
}

// Logged workouts. Backed by Supabase (`sessions` table, scoped by RLS) when
// configured, or by localStorage in developer mode. Kept separate from plans.
export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setSessions([])
      setLoading(false)
      return
    }
    setLoading(true)
    if (!isSupabaseConfigured) {
      setSessions(localLoad())
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('performed_at', { ascending: false })
    if (!error) setSessions((data ?? []).map(fromRow))
    setLoading(false)
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logSession = useCallback(async (session) => {
    if (!isSupabaseConfigured) {
      const created = localCreate(session)
      setSessions((prev) => [created, ...prev].sort(byNewest))
      return created
    }
    const payload = {
      plan_id: session.planId ?? null,
      plan_name: session.planName,
      entries: session.entries,
    }
    // Backdated (post-hoc) logging sets an explicit date.
    if (session.performedAt) {
      payload.performed_at = new Date(session.performedAt).toISOString()
    }
    const { data, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    const created = fromRow(data)
    setSessions((prev) => [created, ...prev].sort(byNewest))
    return created
  }, [])

  const updateSession = useCallback(async (id, updates) => {
    if (!isSupabaseConfigured) {
      const updated = localUpdate(id, updates)
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated } : s)).sort(byNewest),
      )
      return updated
    }
    const patch = {}
    if (updates.planName !== undefined) patch.plan_name = updates.planName
    if (updates.entries !== undefined) patch.entries = updates.entries
    if (updates.performedAt !== undefined)
      patch.performed_at = new Date(updates.performedAt).toISOString()
    const { data, error } = await supabase
      .from('sessions')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const updated = fromRow(data)
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? updated : s)).sort(byNewest),
    )
    return updated
  }, [])

  const removeSession = useCallback(
    async (id) => {
      const prev = sessions
      setSessions((cur) => cur.filter((s) => s.id !== id))
      if (!isSupabaseConfigured) {
        localDelete(id)
        return
      }
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      if (error) {
        setSessions(prev)
        throw error
      }
    },
    [sessions],
  )

  return { sessions, sessionsLoading: loading, logSession, updateSession, removeSession }
}
