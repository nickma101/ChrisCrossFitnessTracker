// User goals store (localStorage). Currently a single weekly workout-frequency
// goal that MyProgress compares against logged sessions.
const KEY = 'crisscross.goals.v1'

const DEFAULT_GOALS = { weeklyWorkoutGoal: 3 }

export function loadGoals() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT_GOALS, ...JSON.parse(raw) } : { ...DEFAULT_GOALS }
  } catch {
    return { ...DEFAULT_GOALS }
  }
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals))
  } catch {
    // Ignore write failures.
  }
}
