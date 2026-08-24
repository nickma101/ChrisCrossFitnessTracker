import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import styles from './MyHistory.module.css'

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function MyHistory() {
  const navigate = useNavigate()
  const { sessions, sessionsLoading, removeSession } = useAppData()

  const handleDelete = (e, session) => {
    e.stopPropagation()
    if (window.confirm(`Delete this workout (${session.planName})? This can't be undone.`)) {
      removeSession(session.id)
    }
  }

  return (
    <div>
      <PageHeader
        icon="🗓️"
        title="MyHistory"
        subtitle="Inspect, edit, or backfill past workouts"
      />

      <Button className={styles.logPast} onClick={() => navigate('/history/new')}>
        ＋ Log a past workout
      </Button>

      {sessionsLoading ? (
        <p className={styles.loading}>Loading your workouts…</p>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon="🗓️"
          message="No workouts logged yet. Finish a workout, or log a past one with the button above."
        />
      ) : (
        <div className={styles.list}>
          {sessions.map((s) => {
            const exercises = (s.entries ?? []).map((e) => e.exerciseName)
            const setCount = (s.entries ?? []).reduce(
              (n, e) => n + (e.sets?.length ?? 0),
              0,
            )
            return (
              <div
                key={s.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/history/${s.id}/edit`)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && navigate(`/history/${s.id}/edit`)
                }
              >
                <div className={styles.cardMain}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.name}>{s.planName || 'Workout'}</h3>
                    <span className={styles.setCount}>
                      {setCount} {setCount === 1 ? 'set' : 'sets'}
                    </span>
                  </div>
                  <p className={styles.date}>{formatDate(s.performedAt)}</p>
                  {exercises.length > 0 && (
                    <p className={styles.exercises}>{exercises.join(' · ')}</p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.delete}
                  onClick={(e) => handleDelete(e, s)}
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
