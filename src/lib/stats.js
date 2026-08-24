// Statistics computed over a time window of logged sessions.

// Previous whole calendar month, e.g. in August this returns all of July.
export function prevMonthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  return { start: start.getTime(), end: thisMonthStart.getTime() - 1 }
}

// Rolling last 30 days up to now.
export function past30Range(now = new Date()) {
  return { start: now.getTime() - 30 * 86400000, end: now.getTime() }
}

// Highest weight logged for an exercise within a single session.
function maxWeightFor(session, exerciseName) {
  let max = null
  for (const e of session.entries ?? []) {
    if (e.exerciseName !== exerciseName) continue
    for (const s of e.sets ?? []) {
      if (s.weight != null && (max == null || s.weight > max)) max = s.weight
    }
  }
  return max
}

// All distinct exercise names performed in a session.
function exercisesIn(session) {
  return [...new Set((session.entries ?? []).map((e) => e.exerciseName))]
}

export function computeStats(sessions, range) {
  const inWindow = sessions
    .filter((s) => s.performedAt >= range.start && s.performedAt <= range.end)
    .sort((a, b) => a.performedAt - b.performedAt) // oldest → newest

  // 1) Number of workouts
  const workouts = inWindow.length

  // 2) Favourite exercise(s): most frequently performed (by session count).
  const counts = new Map()
  for (const s of inWindow) {
    for (const name of exercisesIn(s)) {
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  let favourites = []
  let favouriteCount = 0
  if (counts.size > 0) {
    favouriteCount = Math.max(...counts.values())
    favourites = [...counts.entries()]
      .filter(([, c]) => c === favouriteCount)
      .map(([name]) => name)
  }

  // 3) Biggest improvement per exercise: max weight in the latest training
  //    that included it vs the reference (earliest) training, as a percentage.
  let biggestImprovement = null
  const allNames = new Set(inWindow.flatMap(exercisesIn))
  for (const name of allNames) {
    const withExercise = inWindow.filter(
      (s) => maxWeightFor(s, name) != null,
    )
    if (withExercise.length < 2) continue
    const reference = withExercise[0] // earliest
    const latest = withExercise[withExercise.length - 1] // most recent
    const refMax = maxWeightFor(reference, name)
    const latestMax = maxWeightFor(latest, name)
    if (!refMax || refMax <= 0) continue
    const pct = ((latestMax - refMax) / refMax) * 100
    if (!biggestImprovement || pct > biggestImprovement.pct) {
      biggestImprovement = { exercise: name, pct, refMax, latestMax }
    }
  }

  return { workouts, favourites, favouriteCount, biggestImprovement }
}
