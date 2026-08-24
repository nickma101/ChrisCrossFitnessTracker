import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import ExerciseRow from '../components/ExerciseRow.jsx'
import ScheduleField from '../components/ScheduleField.jsx'
import { usePlans } from '../context/TrainingPlansContext.jsx'
import { normalizeSchedule } from '../data/schedule.js'
import { makeId } from '../lib/storage.js'
import styles from './PlanForm.module.css'

function blankExercise() {
  return { id: makeId(), name: '', sets: '', reps: '', notes: '' }
}

// Normalizes exercises coming from an existing plan or an Excel import into
// the editable string-field form the inputs expect.
function toEditable(exercises) {
  return exercises.map((e) => ({
    id: e.id ?? makeId(),
    name: e.name ?? '',
    sets: e.sets == null ? '' : String(e.sets),
    reps: e.reps == null ? '' : String(e.reps),
    notes: e.notes ?? '',
  }))
}

export default function PlanForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getPlan, createPlan, updatePlan } = usePlans()

  const existing = id ? getPlan(id) : null
  const isEdit = Boolean(existing)
  // Excel import (or "duplicate") can pass a prefill via router state.
  const prefill = location.state?.prefill

  const [name, setName] = useState(existing?.name ?? prefill?.name ?? '')
  const [exercises, setExercises] = useState(() => {
    if (existing?.exercises) return toEditable(existing.exercises)
    if (prefill?.exercises?.length) return toEditable(prefill.exercises)
    return [blankExercise()]
  })
  const [schedule, setSchedule] = useState(() =>
    normalizeSchedule(existing?.schedule),
  )

  const addExercise = () => setExercises((prev) => [...prev, blankExercise()])
  const updateExercise = (exId, next) =>
    setExercises((prev) => prev.map((e) => (e.id === exId ? next : e)))
  const removeExercise = (exId) =>
    setExercises((prev) => prev.filter((e) => e.id !== exId))

  const namedCount = useMemo(
    () => exercises.filter((e) => e.name.trim()).length,
    [exercises],
  )
  const canSave = name.trim().length > 0 && namedCount > 0

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleSave = async () => {
    const cleaned = exercises
      .filter((e) => e.name.trim())
      .map((e) => ({
        id: e.id,
        name: e.name,
        sets: e.sets === '' ? null : Number(e.sets),
        reps: e.reps === '' ? null : Number(e.reps),
        notes: e.notes.trim(),
      }))

    const payload = { name: name.trim(), exercises: cleaned, schedule }
    setSaving(true)
    setSaveError('')
    try {
      if (isEdit) await updatePlan(existing.id, payload)
      else await createPlan(payload)
      navigate('/mytraining')
    } catch (err) {
      setSaveError(err.message ?? 'Could not save the plan. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        icon="📋"
        title={isEdit ? 'Edit Plan' : 'New Plan'}
        subtitle="Name it, add exercises, and set a weekly schedule"
      />

      <label className={styles.nameField}>
        <span className={styles.nameLabel}>Plan name</span>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="e.g. Push Day A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus={!isEdit}
        />
      </label>

      <ScheduleField value={schedule} onChange={setSchedule} />

      <div className={styles.exercises}>
        {exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            index={index}
            exercise={exercise}
            onChange={(next) => updateExercise(exercise.id, next)}
            onRemove={() => removeExercise(exercise.id)}
          />
        ))}
      </div>

      <Button variant="secondary" className={styles.addBtn} onClick={addExercise}>
        ＋ Add exercise
      </Button>

      {saveError && <p className={styles.saveError}>{saveError}</p>}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => navigate('/mytraining')} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create plan'}
        </Button>
      </div>
    </div>
  )
}
