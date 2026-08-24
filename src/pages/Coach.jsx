import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import { ATHLETES } from '../data/coachAthletes.js'
import styles from './Coach.module.css'

export default function Coach() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        icon="🧑‍🏫"
        title="Coach"
        subtitle="Your athletes' plans and progress"
      />

      <p className={styles.note}>
        Sample athletes shown in developer mode. Real athlete accounts arrive
        with multi-user sign-in.
      </p>

      <div className={styles.list}>
        {ATHLETES.map((athlete) => {
          const pct =
            athlete.weeklyGoal > 0
              ? Math.min(100, Math.round((athlete.thisWeek / athlete.weeklyGoal) * 100))
              : 0
          return (
            <button
              key={athlete.id}
              type="button"
              className={styles.card}
              onClick={() => navigate(`/coach/${athlete.id}`)}
            >
              <span className={styles.avatar} aria-hidden="true">
                {athlete.avatar}
              </span>
              <span className={styles.info}>
                <span className={styles.name}>{athlete.name}</span>
                <span className={styles.focus}>{athlete.focus}</span>
                <span className={styles.bar}>
                  <span className={styles.barFill} style={{ width: `${pct}%` }} />
                </span>
                <span className={styles.week}>
                  {athlete.thisWeek}/{athlete.weeklyGoal} this week
                </span>
              </span>
              <span className={styles.chevron} aria-hidden="true">
                ›
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
