// localStorage-backed plans store used in DEVELOPER MODE (when Supabase isn't
// configured). Mirrors the async shape of the Supabase-backed hook so the UI
// is identical in both modes and the real backend can take over unchanged.
import { makeId } from './storage.js'

const STORAGE_KEY = 'crisscross.trainingPlans.v1'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(plans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
  } catch {
    // Ignore write failures (private mode / quota).
  }
}

export function localLoadPlans() {
  // Newest first, matching the Supabase query's ordering.
  return read().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

export function localCreatePlan(plan) {
  const created = {
    id: makeId(),
    name: plan.name,
    exercises: plan.exercises ?? [],
    schedule: plan.schedule ?? [],
    createdAt: Date.now(),
  }
  write([created, ...read()])
  return created
}

export function localUpdatePlan(id, updates) {
  const plans = read()
  const next = plans.map((p) =>
    p.id === id
      ? {
          ...p,
          name: updates.name,
          exercises: updates.exercises,
          schedule: updates.schedule ?? [],
        }
      : p,
  )
  write(next)
  return next.find((p) => p.id === id)
}

export function localDeletePlan(id) {
  write(read().filter((p) => p.id !== id))
}
