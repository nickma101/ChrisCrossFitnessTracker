import { makeId } from './storage.js'
import { isCardio } from '../data/exercises.js'

// A workout "draft" is the in-progress workout held in ActiveWorkoutContext.
// Entries are either strength (sets with reps/weight + a per-set `logged`
// flag) or cardio (minutes + intensity + a single `logged` flag).

export function blankStrengthEntry(name = '') {
  return {
    id: makeId(),
    name,
    type: 'strength',
    targetSets: null,
    targetReps: null,
    sets: [{ reps: '', weight: '', logged: false }],
  }
}

export function blankCardioEntry(name = '') {
  return {
    id: makeId(),
    name,
    type: 'cardio',
    targetMinutes: null,
    minutes: '',
    intensity: '',
    logged: false,
  }
}

// A blank entry of the right type for the given exercise name.
export function blankEntry(name = '') {
  return isCardio(name) ? blankCardioEntry(name) : blankStrengthEntry(name)
}

// Build a draft entry from a plan exercise (carrying targets across).
export function entryFromPlanExercise(ex) {
  const type = ex.type || (isCardio(ex.name) ? 'cardio' : 'strength')
  if (type === 'cardio') {
    return {
      id: ex.id ?? makeId(),
      name: ex.name,
      type: 'cardio',
      targetMinutes: ex.minutes ?? null,
      minutes: '',
      intensity: ex.intensity ?? '',
      logged: false,
    }
  }
  const count = ex.sets && ex.sets > 0 ? ex.sets : 1
  return {
    id: ex.id ?? makeId(),
    name: ex.name,
    type: 'strength',
    targetSets: ex.sets ?? null,
    targetReps: ex.reps ?? null,
    sets: Array.from({ length: count }, () => ({ reps: '', weight: '', logged: false })),
  }
}

export function draftFromPlan(plan) {
  return { planId: plan.id, name: plan.name, log: plan.exercises.map(entryFromPlanExercise) }
}

export function scratchDraft() {
  return { planId: null, name: 'Workout', log: [] }
}

// How many things have been logged (strength sets + cardio entries).
export function loggedCount(log) {
  return log.reduce((n, e) => {
    if (e.type === 'cardio') return n + (e.logged ? 1 : 0)
    return n + e.sets.filter((s) => s.logged).length
  }, 0)
}

// Turn a draft log into the entries persisted to the DB (logged items only).
export function commitEntries(log) {
  return log
    .filter((e) =>
      e.name &&
      (e.type === 'cardio' ? e.logged && e.minutes !== '' : e.sets.some((s) => s.logged)),
    )
    .map((e) => {
      if (e.type === 'cardio') {
        return {
          exerciseName: e.name,
          type: 'cardio',
          minutes: e.minutes === '' ? null : Number(e.minutes),
          intensity: e.intensity || null,
        }
      }
      return {
        exerciseName: e.name,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        sets: e.sets
          .filter((s) => s.logged)
          .map((s) => ({
            reps: s.reps === '' ? null : Number(s.reps),
            weight: s.weight === '' ? null : Number(s.weight),
          })),
      }
    })
}
