import { EXERCISE_GROUPS, INTENSITIES, isCardio } from '../data/exercises.js'
import styles from './ExerciseRow.module.css'

export default function ExerciseRow({ index, exercise, onChange, onRemove }) {
  const update = (field, value) => onChange({ ...exercise, [field]: value })
  const cardio = isCardio(exercise.name)

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <span className={styles.badge}>{index + 1}</span>
        <select
          className={styles.select}
          value={exercise.name}
          onChange={(e) => update('name', e.target.value)}
          aria-label="Exercise"
        >
          <option value="">Choose an exercise…</option>
          {EXERCISE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label="Remove exercise"
        >
          ✕
        </button>
      </div>

      {cardio ? (
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Target minutes</span>
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="20"
              value={exercise.minutes ?? ''}
              onChange={(e) => update('minutes', e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Intensity</span>
            <select
              className={styles.input}
              value={exercise.intensity ?? ''}
              onChange={(e) => update('intensity', e.target.value)}
            >
              <option value="">Any</option>
              {INTENSITIES.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Sets</span>
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="3"
              value={exercise.sets}
              onChange={(e) => update('sets', e.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Target reps</span>
            <input
              className={styles.input}
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="10"
              value={exercise.reps}
              onChange={(e) => update('reps', e.target.value)}
            />
          </label>
        </div>
      )}

      <label className={styles.field}>
        <span className={styles.label}>Notes</span>
        <textarea
          className={styles.textarea}
          rows="2"
          placeholder="e.g. tempo, RPE, form cues…"
          value={exercise.notes}
          onChange={(e) => update('notes', e.target.value)}
        />
      </label>
    </div>
  )
}
