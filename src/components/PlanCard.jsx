import { Link } from 'react-router-dom'
import ScheduleBadge from './ScheduleBadge.jsx'
import styles from './PlanCard.module.css'

export default function PlanCard({ plan, onDelete }) {
  const count = plan.exercises?.length ?? 0

  return (
    <div className={styles.card}>
      <Link to={`/mytraining/${plan.id}/edit`} className={styles.main}>
        <div className={styles.top}>
          <h3 className={styles.name}>{plan.name}</h3>
          <span className={styles.count}>
            {count} {count === 1 ? 'exercise' : 'exercises'}
          </span>
        </div>
        {count > 0 && (
          <p className={styles.preview}>
            {plan.exercises.map((e) => e.name).join(' · ')}
          </p>
        )}
        <ScheduleBadge schedule={plan.schedule} />
      </Link>
      {onDelete && (
        <button
          type="button"
          className={styles.delete}
          onClick={() => onDelete(plan)}
          aria-label={`Delete ${plan.name}`}
        >
          🗑
        </button>
      )}
    </div>
  )
}
