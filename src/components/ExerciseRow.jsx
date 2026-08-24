import { EXERCISES } from '../data/exercises.js'
import styles from './ExerciseRow.module.css'

export default function ExerciseRow({ index, exercise, onChange, onRemove }) {
  const update = (field, value) => onChange({ ...exercise, [field]: value })

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
          {EXERCISES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
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
