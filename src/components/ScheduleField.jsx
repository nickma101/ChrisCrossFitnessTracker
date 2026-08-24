import { WEEKDAYS } from '../data/weekdays.js'
import { SCHEDULE_TYPES, normalizeSchedule } from '../data/schedule.js'
import styles from './ScheduleField.module.css'

// Controlled schedule editor. `value` is a schedule object (or legacy array),
// `onChange` receives the updated schedule object.
export default function ScheduleField({ value, onChange }) {
  const schedule = normalizeSchedule(value)

  const setType = (type) => onChange({ ...schedule, type })

  const toggleDay = (code) => {
    const selected = schedule.days.includes(code)
      ? schedule.days.filter((d) => d !== code)
      : [...schedule.days, code]
    // Keep the days in canonical Mon→Sun order.
    const days = WEEKDAYS.map((d) => d.code).filter((c) => selected.includes(c))
    onChange({ ...schedule, days })
  }

  const setNumber = (field, delta, min, max) => {
    const next = Math.min(max, Math.max(min, schedule[field] + delta))
    onChange({ ...schedule, [field]: next })
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Schedule (optional)</span>

      <div className={styles.segment}>
        {SCHEDULE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`${styles.segBtn} ${schedule.type === t.value ? styles.segOn : ''}`.trim()}
            onClick={() => setType(t.value)}
            aria-pressed={schedule.type === t.value}
          >
            {t.label}
          </button>
        ))}
      </div>

      {schedule.type === 'days' && (
        <div className={styles.days}>
          {WEEKDAYS.map((day) => (
            <button
              key={day.code}
              type="button"
              className={`${styles.day} ${schedule.days.includes(day.code) ? styles.dayOn : ''}`.trim()}
              onClick={() => toggleDay(day.code)}
              aria-pressed={schedule.days.includes(day.code)}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}

      {schedule.type === 'weekly' && (
        <div className={styles.stepperRow}>
          <span className={styles.stepperLabel}>Workouts per week</span>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setNumber('timesPerWeek', -1, 1, 14)}
              aria-label="Fewer per week"
            >
              −
            </button>
            <span className={styles.stepValue}>{schedule.timesPerWeek}</span>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setNumber('timesPerWeek', 1, 1, 14)}
              aria-label="More per week"
            >
              +
            </button>
          </div>
        </div>
      )}

      {schedule.type === 'interval' && (
        <div className={styles.stepperRow}>
          <span className={styles.stepperLabel}>Repeat every</span>
          <div className={styles.stepper}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setNumber('everyDays', -1, 1, 30)}
              aria-label="Fewer days"
            >
              −
            </button>
            <span className={styles.stepValue}>
              {schedule.everyDays} {schedule.everyDays === 1 ? 'day' : 'days'}
            </span>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setNumber('everyDays', 1, 1, 30)}
              aria-label="More days"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
