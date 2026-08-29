import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import { useActiveWorkout } from '../context/ActiveWorkoutContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { EXERCISE_GROUPS, INTENSITIES } from '../data/exercises.js'
import { blankStrengthEntry, blankEntry, loggedCount, commitEntries } from '../lib/workoutDraft.js'
import styles from './WorkoutSession.module.css'

function ExerciseSelect({ value, onChange }) {
  return (
    <select
      className={styles.exSelect}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Exercise"
    >
      <option value="">Choose an exercise…</option>
      {EXERCISE_GROUPS.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.options.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

export default function WorkoutSession() {
  const navigate = useNavigate()
  const { active, patchWorkout, discardWorkout } = useActiveWorkout()
  const { logSession } = useAppData()
  const [saving, setSaving] = useState(false)

  const logged = useMemo(() => (active ? loggedCount(active.log) : 0), [active])

  if (!active) {
    return (
      <div>
        <PageHeader icon="🏋️" title="Workout" />
        <EmptyState
          icon="🏋️"
          message="No workout in progress. Start one from the Workout tab."
          action={<Button onClick={() => navigate('/workout')}>Go to Workout</Button>}
        />
      </div>
    )
  }

  const setLog = (fn) => patchWorkout((a) => ({ ...a, log: fn(a.log) }))
  const setName = (name) => patchWorkout((a) => ({ ...a, name }))

  const changeName = (id, name) =>
    setLog((log) => log.map((e) => (e.id === id ? { ...blankEntry(name), id } : e)))
  const removeEntry = (id) => setLog((log) => log.filter((e) => e.id !== id))
  const addExercise = () => setLog((log) => [...log, blankStrengthEntry('')])

  // strength helpers
  const updateSet = (id, i, field, val) =>
    setLog((log) =>
      log.map((e) =>
        e.id === id
          ? { ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, [field]: val } : s)) }
          : e,
      ),
    )
  const toggleSet = (id, i) =>
    setLog((log) =>
      log.map((e) =>
        e.id === id
          ? { ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, logged: !s.logged } : s)) }
          : e,
      ),
    )
  const addSet = (id) =>
    setLog((log) =>
      log.map((e) =>
        e.id === id ? { ...e, sets: [...e.sets, { reps: '', weight: '', logged: false }] } : e,
      ),
    )
  const removeSet = (id, i) =>
    setLog((log) =>
      log.map((e) => (e.id === id ? { ...e, sets: e.sets.filter((_, j) => j !== i) } : e)),
    )

  // cardio helpers
  const updateCardio = (id, field, val) =>
    setLog((log) => log.map((e) => (e.id === id ? { ...e, [field]: val } : e)))
  const toggleCardio = (id) =>
    setLog((log) => log.map((e) => (e.id === id ? { ...e, logged: !e.logged } : e)))

  const finish = async () => {
    setSaving(true)
    const entries = commitEntries(active.log)
    try {
      await logSession({
        planId: active.planId,
        planName: (active.name || '').trim() || 'Workout',
        entries,
        performedAt: Date.now(),
      })
      discardWorkout()
      navigate('/history')
    } catch {
      setSaving(false)
    }
  }

  const discard = () => {
    if (window.confirm('Discard this workout? Logged sets will be lost.')) {
      discardWorkout()
      navigate('/workout')
    }
  }

  return (
    <div>
      <PageHeader icon="🏋️" title="Workout" subtitle="Log each set as you complete it" />

      <label className={styles.nameField}>
        <span className={styles.nameLabel}>Workout name</span>
        <input
          className={styles.nameInput}
          type="text"
          value={active.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day"
        />
      </label>

      <div className={styles.exercises}>
        {active.log.map((entry) => (
          <div key={entry.id} className={styles.exercise}>
            <div className={styles.exHead}>
              <ExerciseSelect value={entry.name} onChange={(n) => changeName(entry.id, n)} />
              {entry.type === 'cardio'
                ? entry.targetMinutes && (
                    <span className={styles.target}>{entry.targetMinutes} min</span>
                  )
                : (entry.targetSets || entry.targetReps) && (
                    <span className={styles.target}>
                      {entry.targetSets ?? '–'} × {entry.targetReps ?? '–'}
                    </span>
                  )}
              <button
                type="button"
                className={styles.removeEx}
                onClick={() => removeEntry(entry.id)}
                aria-label="Remove exercise from this workout"
                title="Remove from this workout only"
              >
                ✕
              </button>
            </div>

            {entry.type === 'cardio' ? (
              <div className={styles.cardio}>
                <div className={styles.cardioFields}>
                  <label className={styles.cardioField}>
                    <span className={styles.smallLabel}>Minutes</span>
                    <input
                      className={styles.input}
                      type="number"
                      inputMode="numeric"
                      placeholder="20"
                      value={entry.minutes}
                      readOnly={entry.logged}
                      onChange={(e) => updateCardio(entry.id, 'minutes', e.target.value)}
                    />
                  </label>
                  <div className={styles.cardioField}>
                    <span className={styles.smallLabel}>Intensity</span>
                    <div className={styles.intensity}>
                      {INTENSITIES.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          disabled={entry.logged}
                          className={`${styles.intBtn} ${entry.intensity === lvl ? styles.intOn : ''}`.trim()}
                          onClick={() => updateCardio(entry.id, 'intensity', lvl)}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.logWide} ${entry.logged ? styles.logOn : ''}`.trim()}
                  onClick={() => toggleCardio(entry.id)}
                >
                  {entry.logged ? '✓ Logged' : 'Log warm-up'}
                </button>
              </div>
            ) : (
              <>
                <div className={styles.setHeaderRow}>
                  <span className={styles.setCol}>Set</span>
                  <span className={styles.inputCol}>Reps</span>
                  <span className={styles.inputCol}>Weight</span>
                  <span className={styles.logCol} />
                </div>
                {entry.sets.map((set, i) => (
                  <div
                    key={i}
                    className={`${styles.setRow} ${set.logged ? styles.setLogged : ''}`.trim()}
                  >
                    <span className={styles.setCol}>{i + 1}</span>
                    <input
                      className={styles.input}
                      type="number"
                      inputMode="numeric"
                      placeholder={entry.targetReps ? String(entry.targetReps) : 'reps'}
                      value={set.reps}
                      readOnly={set.logged}
                      onChange={(e) => updateSet(entry.id, i, 'reps', e.target.value)}
                    />
                    <input
                      className={styles.input}
                      type="number"
                      inputMode="decimal"
                      placeholder="kg"
                      value={set.weight}
                      readOnly={set.logged}
                      onChange={(e) => updateSet(entry.id, i, 'weight', e.target.value)}
                    />
                    <button
                      type="button"
                      className={`${styles.logBtn} ${set.logged ? styles.logOn : ''}`.trim()}
                      onClick={() => toggleSet(entry.id, i)}
                    >
                      {set.logged ? '✓' : 'Log'}
                    </button>
                    <button
                      type="button"
                      className={styles.removeSet}
                      onClick={() => removeSet(entry.id, i)}
                      aria-label="Remove set"
                      disabled={entry.sets.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addSet} onClick={() => addSet(entry.id)}>
                  ＋ Add set
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <Button variant="secondary" className={styles.addExercise} onClick={addExercise}>
        ＋ Add exercise
      </Button>

      <div className={styles.footer}>
        <button type="button" className={styles.discard} onClick={discard}>
          Discard
        </button>
        <span className={styles.countHint}>
          {logged} {logged === 1 ? 'item' : 'items'} logged
        </span>
        <Button onClick={finish} disabled={saving || logged === 0}>
          {saving ? 'Saving…' : 'Finish'}
        </Button>
      </div>
    </div>
  )
}
