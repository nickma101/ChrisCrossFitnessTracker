// Logged workout sessions store (localStorage). A session is one performed
// workout, with the actual sets/reps/weight logged per exercise.
//
// Session shape:
// {
//   id, planId, planName, performedAt (ms),
//   entries: [{ exerciseName, targetSets, targetReps,
//               sets: [{ reps: number|null, weight: number|null }] }]
// }
import { makeId } from './storage.js'

const KEY = 'crisscross.sessions.v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(sessions) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sessions))
  } catch {
    // Ignore write failures.
  }
}

export function loadSessions() {
  return read().sort((a, b) => (b.performedAt ?? 0) - (a.performedAt ?? 0))
}

export function createSession(session) {
  const created = {
    id: makeId(),
    performedAt: Date.now(),
    ...session,
  }
  write([created, ...read()])
  return created
}

export function updateSession(id, updates) {
  const next = read().map((s) => (s.id === id ? { ...s, ...updates } : s))
  write(next)
  return next.find((s) => s.id === id)
}

export function deleteSession(id) {
  write(read().filter((s) => s.id !== id))
}
