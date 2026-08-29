import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import { usePlans } from '../context/TrainingPlansContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { EXERCISE_GROUPS, INTENSITIES, isCardio } from '../data/exercises.js'
import { makeId } from '../lib/storage.js'
import styles from './SessionEditor.module.css'

function blankSet() {
  return { reps: '', weight: '' }
}

function makeEntry(name) {
  if (isCardio(name)) {
    return { id: makeId(), name, type: 'cardio', minutes: '', intensity: '' }
  }
  return { id: makeId(), name, type: 'strength', targetSets: null, targetReps: null, sets: [blankSet()] }
}

function dateToInput(ms) {
  const d = new Date(ms)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Parse a YYYY-MM-DD input as local noon (avoids timezone day-shifts).
function inputToMs(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0).getTime()
}

function toEditableEntries(entries) {
  return (entries ?? []).map((e) => {
    if (e.type === 'cardio') {
      return {
        id: makeId(),
        name: e.exerciseName ?? '',
        type: 'cardio',
        minutes: e.minutes == null ? '' : String(e.minutes),
        intensity: e.intensity ?? '',
      }
    }
    return {
      id: makeId(),
      name: e.exerciseName ?? '',
      type: 'strength',
      targetSets: e.targetSets ?? null,
      targetReps: e.targetReps ?? null,
      sets:
        e.sets && e.sets.length
          ? e.sets.map((s) => ({
              reps: s.reps == null ? '' : String(s.reps),
              weight: s.weight == null ? '' : String(s.weight),
            }))
          : [blankSet()],
    }
  })
}

function planToEntries(plan) {
  return plan.exercises.map((ex) => {
    const type = ex.type || (isCardio(ex.name) ? 'cardio' : 'strength')
    if (type === 'cardio') {
      return { id: makeId(), name: ex.name, type: 'cardio', minutes: '', intensity: ex.intensity ?? '' }
    }
    const count = ex.sets && ex.sets > 0 ? ex.sets : 1
    return {
      id: makeId(),
      name: ex.name,
      type: 'strength',
      targetSets: ex.sets ?? null,
      targetReps: ex.reps ?? null,
      sets: Array.from({ length: count }, blankSet),
    }
  })
}

export default function SessionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { plans } = usePlans()
  const { sessions, sessionsLoading, logSession, updateSession } = useAppData()
  const existing = isEdit ? sessions.find((s) => s.id === id) : null

  const [name, setName] = useState('')
  const [dateStr, setDateStr] = useState(() => dateToInput(Date.now()))
  const [entries, setEntries] = useState([])
  const [seeded, setSeeded] = useState(!isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && existing && !seeded) {
      setName(existing.planName || '')
      setDateStr(dateToInput(existing.performedAt))
      setEntries(toEditableEntries(existing.entries))
      setSeeded(true)
    }
  }, [isEdit, existing, seeded])

  const changeName = (eid, newName) =>
    setEntries((prev) => prev.map((e) => (e.id === eid ? { ...makeEntry(newName), id: eid } : e)))
  const removeEntry = (eid) => setEntries((prev) => prev.filter((e) => e.id !== eid))
  const addEntry = () => setEntries((prev) => [...prev, makeEntry('')])

  const updateCardio = (eid, field, val) =>
    setEntries((prev) => prev.map((e) => (e.id === eid ? { ...e, [field]: val } : e)))
  const updateSet = (eid, i, field, val) =>
    setEntries((prev) =>
      prev.map((e) =>
        e.id === eid
          ? { ...e, sets: e.sets.map((s, j) => (j === i ? { ...s, [field]: val } : s)) }
          : e,
      ),
    )
  const addSet = (eid) =>
    setEntries((prev) =>
      prev.map((e) => (e.id === eid ? { ...e, sets: [...e.sets, blankSet()] } : e)),
    )
  const removeSet = (eid, i) =>
    setEntries((prev) =>
      prev.map((e) => (e.id === eid ? { ...e, sets: e.sets.filter((_, j) => j !== i) } : e)),
    )

  const prefillFromPlan = (planId) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return
    setName(plan.name)
    setEntries(planToEntries(plan))
  }

  const canSave = useMemo(
    () => entries.some((e) => e.name.trim()) && Boolean(dateStr),
    [entries, dateStr],
  )

  const handleSave = async () => {
    const cleaned = entries
      .filter((e) => e.name.trim())
      .map((e) =>
        e.type === 'cardio'
          ? {
              exerciseName: e.name,
              type: 'cardio',
              minutes: e.minutes === '' ? null : Number(e.minutes),
              intensity: e.intensity || null,
            }
          : {
              exerciseName: e.name,
              targetSets: e.targetSets,
              targetReps: e.targetReps,
              sets: e.sets
                .filter((s) => s.reps !== '' || s.weight !== '')
                .map((s) => ({
                  reps: s.reps === '' ? null : Number(s.reps),
                  weight: s.weight === '' ? null : Number(s.weight),
                })),
            },
      )

    const performedAt = inputToMs(dateStr)
    const workoutName = name.trim() || 'Workout'
    setSaving(true)
    try {
      if (isEdit) {
        await updateSession(id, { planName: workoutName, entries: cleaned, performedAt })
      } else {
        await logSession({ planId: null, planName: workoutName, entries: cleaned, performedAt })
      }
      navigate('/history')
    } catch {
      setSaving(false)
    }
  }

  if (isEdit && !existing) {
    return (
      <div>
        <PageHeader icon="🗓️" title="Edit workout" />
        {sessionsLoading ? (
          <p className={styles.loading}>Loading…</p>
        ) : (
          <EmptyState
            icon="🤔"
            message="That workout couldn't be found."
            action={<Button onClick={() => navigate('/history')}>Back to History</Button>}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        icon="🗓️"
        title={isEdit ? 'Edit workout' : 'Log past workout'}
        subtitle={isEdit ? 'Fix anything you logged wrong' : 'Record a workout you forgot to log'}
      />

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>Workout name</span>
          <input
            className={styles.input}
            type="text"
            placeholder="e.g. Push Day"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Date</span>
          <input
            className={styles.input}
            type="date"
            value={dateStr}
            max={dateToInput(Date.now())}
            onChange={(e) => setDateStr(e.target.value)}
          />
        </label>
      </div>

      {!isEdit && plans.length > 0 && (
        <label className={styles.field}>
          <span className={styles.label}>Start from a plan (optional)</span>
          <select
            className={styles.input}
            defaultValue=""
            onChange={(e) => e.target.value && prefillFromPlan(e.target.value)}
          >
            <option value="">Blank workout</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className={styles.exercises}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.exercise}>
            <div className={styles.exHead}>
              <select
                className={styles.exSelect}
                value={entry.name}
                onChange={(e) => changeName(entry.id, e.target.value)}
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
              <button
                type="button"
                className={styles.removeEx}
                onClick={() => removeEntry(entry.id)}
                aria-label="Remove exercise"
              >
                ✕
              </button>
            </div>

            {entry.type === 'cardio' ? (
              <div className={styles.cardioFields}>
                <label className={styles.cardioField}>
                  <span className={styles.smallLabel}>Minutes</span>
                  <input
                    className={styles.setInput}
                    type="number"
                    inputMode="numeric"
                    placeholder="20"
                    value={entry.minutes}
                    onChange={(e) => updateCardio(entry.id, 'minutes', e.target.value)}
                  />
                </label>
                <label className={styles.cardioField}>
                  <span className={styles.smallLabel}>Intensity</span>
                  <select
                    className={styles.setInput}
                    value={entry.intensity}
                    onChange={(e) => updateCardio(entry.id, 'intensity', e.target.value)}
                  >
                    <option value="">—</option>
                    {INTENSITIES.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <>
                <div className={styles.setHeaderRow}>
                  <span className={styles.setCol}>Set</span>
                  <span className={styles.inputCol}>Reps</span>
                  <span className={styles.inputCol}>Weight</span>
                  <span className={styles.removeCol} />
                </div>
                {entry.sets.map((set, i) => (
                  <div key={i} className={styles.setRow}>
                    <span className={styles.setCol}>{i + 1}</span>
                    <input
                      className={styles.setInput}
                      type="number"
                      inputMode="numeric"
                      placeholder={entry.targetReps ? String(entry.targetReps) : 'reps'}
                      value={set.reps}
                      onChange={(e) => updateSet(entry.id, i, 'reps', e.target.value)}
                    />
                    <input
                      className={styles.setInput}
                      type="number"
                      inputMode="decimal"
                      placeholder="kg"
                      value={set.weight}
                      onChange={(e) => updateSet(entry.id, i, 'weight', e.target.value)}
                    />
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

      <Button variant="secondary" className={styles.addExercise} onClick={addEntry}>
        ＋ Add exercise
      </Button>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate('/history')} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save workout'}
        </Button>
      </div>
    </div>
  )
}
