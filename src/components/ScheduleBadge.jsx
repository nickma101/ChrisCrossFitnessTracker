import { scheduleChips } from '../data/schedule.js'
import styles from './ScheduleBadge.module.css'

// Renders a plan's schedule as chips: weekday chips for a 'days' schedule,
// or a single descriptive chip for 'weekly' / 'interval'. Renders nothing
// when there's no schedule set.
export default function ScheduleBadge({ schedule }) {
  const chips = scheduleChips(schedule)
  if (chips.length === 0) return null
  return (
    <div className={styles.chips}>
      {chips.map((chip) => (
        <span key={chip} className={styles.chip}>
          {chip}
        </span>
      ))}
    </div>
  )
}
