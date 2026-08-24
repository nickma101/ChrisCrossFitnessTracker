import { useMemo } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import StatsPanel from '../components/StatsPanel.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import styles from './MyProgress.module.css'

function startOfWeek(now = new Date()) {
  const d = new Date(now)
  const day = (d.getDay() + 6) % 7 // 0 = Monday
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d.getTime()
}

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function MyProgress() {
  const { sessions, sessionsLoading, goals, removeSession } = useAppData()

  const thisWeek = useMemo(
    () => sessions.filter((s) => s.performedAt >= startOfWeek()).length,
    [sessions],
  )

  const goal = goals.weeklyWorkoutGoal
  const pct = goal > 0 ? Math.min(100, Math.round((thisWeek / goal) * 100)) : 0
  const goalMet = thisWeek >= goal

  return (
    <div>
      <PageHeader icon="📈" title="MyProgress" subtitle="Your stats and goal tracking" />

      <section className={styles.goalCard}>
        <div className={styles.goalTop}>
          <span className={styles.goalLabel}>This week</span>
          <span className={styles.goalCount}>
            {thisWeek} / {goal} workouts
          </span>
        </div>
        <div className={styles.bar}>
          <div
            className={`${styles.barFill} ${goalMet ? styles.barMet : ''}`.trim()}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={styles.goalNote}>
          {goalMet
            ? '🎉 Weekly goal reached — nice work!'
            : `${goal - thisWeek} more to hit your weekly goal.`}
        </p>
      </section>

      <h2 className={styles.sectionTitle}>Statistics</h2>
      <div className={styles.statsWrap}>
        <StatsPanel sessions={sessions} />
      </div>

      <h2 className={styles.sectionTitle}>Recent workouts</h2>
      {sessionsLoading ? (
        <p className={styles.loading}>Loading…</p>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="📊"
          message="No workouts logged yet. Finish a workout and your history and stats will appear here."
        />
      ) : (
        <div className={styles.list}>
          {sessions.map((s) => {
            const setCount = (s.entries ?? []).reduce(
              (n, e) => n + (e.sets?.length ?? 0),
              0,
            )
            return (
              <div key={s.id} className={styles.sessionRow}>
                <div className={styles.sessionInfo}>
                  <h3 className={styles.sessionName}>{s.planName}</h3>
                  <p className={styles.sessionMeta}>
                    {formatDate(s.performedAt)} · {setCount}{' '}
                    {setCount === 1 ? 'set' : 'sets'}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.delete}
                  onClick={() => removeSession(s.id)}
                  aria-label="Delete workout"
                >
                  🗑
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
