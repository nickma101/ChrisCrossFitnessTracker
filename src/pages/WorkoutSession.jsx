import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import { usePlans } from '../context/TrainingPlansContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { EXERCISES } from '../data/exercises.js'
import { makeId } from '../lib/storage.js'
import styles from './WorkoutSession.module.css'

// One editable set row.
function blankSet() {
  return { reps: '', weight: '', logged: false }
}

// Builds the initial log from a plan: one row per target set.
function initLog(plan) {
  return plan.exercises.map((ex) => {
    const setCount = ex.sets && ex.sets > 0 ? ex.sets : 1
    return {
      exerciseId: ex.id,
      name: ex.name,
      targetSets: ex.sets ?? null,
      targetReps: ex.reps ?? null,
      sets: Array.from({ length: setCount }, blankSet),
    }
  })
}

export default function WorkoutSession() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { getPlan } = usePlans()
  const { logSession } = useAppData()

  const plan = getPlan(planId)
  const [log, setLog] = useState(() => (plan ? initLog(plan) : []))
  const [saving, setSaving] = useState(false)

  const loggedSetCount = useMemo(
    () =>
      log.reduce((n, ex) => n + ex.sets.filter((s) => s.logged).length, 0),
    [log],
  )

  if (!plan) {
    return (
      <div>
        <PageHeader icon="🏋️" title="Workout" />
        <EmptyState
          icon="🤔"
          message="That plan couldn't be found."
          action={<Button onClick={() => navigate('/workout')}>Back to Workout</Button>}
        />
      </div>
    )
  }

  const patchExercise = (exId, patch) =>
    setLog((prev) =>
      prev.map((ex) => (ex.exerciseId === exId ? { ...ex, ...patch } : ex)),
    )

  const updateSet = (exId, setIdx, field, value) =>
    setLog((prev) =>
      prev.map((ex) =>
        ex.exerciseId === exId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIdx ? { ...s, [field]: value } : s,
              ),
            }
          : ex,
      ),
    )

  const toggleLogged = (exId, setIdx) =>
    setLog((prev) =>
      prev.map((ex) =>
        ex.exerciseId === exId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) =>
                i === setIdx ? { ...s, logged: !s.logged } : s,
              ),
            }
          : ex,
      ),
    )

  const addSet = (exId) =>
    setLog((prev) =>
      prev.map((ex) =>
        ex.exerciseId === exId ? { ...ex, sets: [...ex.sets, blankSet()] } : ex,
      ),
    )

  const removeSet = (exId, setIdx) =>
    setLog((prev) =>
      prev.map((ex) =>
        ex.exerciseId === exId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) }
          : ex,
      ),
    )

  // Remove an exercise from THIS workout only (never touches the plan).
  const removeExercise = (exId) =>
    setLog((prev) => prev.filter((ex) => ex.exerciseId !== exId))

  // Add an exercise to THIS workout only.
  const addExercise = () =>
    setLog((prev) => [
      ...prev,
      {
        exerciseId: makeId(),
        name: '',
        targetSets: null,
        targetReps: null,
        sets: [blankSet()],
        added: true,
      },
    ])

  const finish = async () => {
    setSaving(true)
    const entries = log
      .filter((ex) => ex.name && ex.sets.some((s) => s.logged))
      .map((ex) => ({
        exerciseName: ex.name,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        sets: ex.sets
          .filter((s) => s.logged)
          .map((s) => ({
            reps: s.reps === '' ? null : Number(s.reps),
            weight: s.weight === '' ? null : Number(s.weight),
          })),
      }))
    try {
      await logSession({ planId: plan.id, planName: plan.name, entries })
      navigate('/progress')
    } catch {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        icon="🏋️"
        title={plan.name}
        subtitle="Log each set as you complete it"
      />

      <div className={styles.exercises}>
        {log.map((ex) => (
          <div key={ex.exerciseId} className={styles.exercise}>
            <div className={styles.exHead}>
              {ex.name && !ex.added ? (
                <h3 className={styles.exName}>{ex.name}</h3>
              ) : (
                <select
                  className={styles.exSelect}
                  value={ex.name}
                  onChange={(e) => patchExercise(ex.exerciseId, { name: e.target.value })}
                  aria-label="Exercise"
                >
                  <option value="">Choose an exercise…</option>
                  {EXERCISES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
              {(ex.targetSets || ex.targetReps) && (
                <span className={styles.target}>
                  {ex.targetSets ?? '–'} × {ex.targetReps ?? '–'}
                </span>
              )}
              <button
                type="button"
                className={styles.removeEx}
                onClick={() => removeExercise(ex.exerciseId)}
                aria-label={`Remove ${ex.name || 'exercise'} from this workout`}
                title="Remove from this workout only"
              >
                ✕
              </button>
            </div>

            <div className={styles.setHeaderRow}>
              <span className={styles.setCol}>Set</span>
              <span className={styles.inputCol}>Reps</span>
              <span className={styles.inputCol}>Weight</span>
              <span className={styles.logCol} />
            </div>

            {ex.sets.map((set, i) => (
              <div
                key={i}
                className={`${styles.setRow} ${set.logged ? styles.setLogged : ''}`.trim()}
              >
                <span className={styles.setCol}>{i + 1}</span>
                <input
                  className={styles.input}
                  type="number"
                  inputMode="numeric"
                  placeholder={ex.targetReps ? String(ex.targetReps) : 'reps'}
                  value={set.reps}
                  readOnly={set.logged}
                  onChange={(e) => updateSet(ex.exerciseId, i, 'reps', e.target.value)}
                />
                <input
                  className={styles.input}
                  type="number"
                  inputMode="decimal"
                  placeholder="kg"
                  value={set.weight}
                  readOnly={set.logged}
                  onChange={(e) => updateSet(ex.exerciseId, i, 'weight', e.target.value)}
                />
                <button
                  type="button"
                  className={`${styles.logBtn} ${set.logged ? styles.logBtnOn : ''}`.trim()}
                  onClick={() => toggleLogged(ex.exerciseId, i)}
                >
                  {set.logged ? '✓ Logged' : 'Log'}
                </button>
                <button
                  type="button"
                  className={styles.removeSet}
                  onClick={() => removeSet(ex.exerciseId, i)}
                  aria-label="Remove set"
                  disabled={ex.sets.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              className={styles.addSet}
              onClick={() => addSet(ex.exerciseId)}
            >
              ＋ Add set
            </button>
          </div>
        ))}
      </div>

      <Button variant="secondary" className={styles.addExercise} onClick={addExercise}>
        ＋ Add exercise (this workout only)
      </Button>

      <div className={styles.footer}>
        <span className={styles.countHint}>
          {loggedSetCount} {loggedSetCount === 1 ? 'set' : 'sets'} logged
        </span>
        <Button onClick={finish} disabled={saving || loggedSetCount === 0}>
          {saving ? 'Saving…' : 'Finish workout'}
        </Button>
      </div>
    </div>
  )
}
