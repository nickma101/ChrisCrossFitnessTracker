// Coach-created custom plans, keyed by athlete id, persisted locally.
// Shape: { [athleteId]: [ { id, name, schedule, exercises } ] }
const KEY = 'crisscross.coachPlans.v1'

export function loadCoachPlans() {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveCoachPlans(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // Ignore write failures.
  }
}
