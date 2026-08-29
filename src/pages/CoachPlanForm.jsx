import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import Button from '../components/Button.jsx'
import ExerciseRow from '../components/ExerciseRow.jsx'
import ScheduleField from '../components/ScheduleField.jsx'
import { getAthlete } from '../data/coachAthletes.js'
import { useAppData } from '../context/AppDataContext.jsx'
import { normalizeSchedule } from '../data/schedule.js'
import { isCardio } from '../data/exercises.js'
import { makeId } from '../lib/storage.js'
import styles from './PlanForm.module.css'

function blankExercise() {
  return { id: makeId(), name: '', sets: '', reps: '', notes: '' }
}

// Normalize exercises from an Excel import into the editable string form.
function toEditable(exercises) {
  return exercises.map((e) => ({
    id: e.id ?? makeId(),
    name: e.name ?? '',
    sets: e.sets == null ? '' : String(e.sets),
    reps: e.reps == null ? '' : String(e.reps),
    minutes: e.minutes == null ? '' : String(e.minutes),
    intensity: e.intensity ?? '',
    notes: e.notes ?? '',
  }))
}

export default function CoachPlanForm() {
  const { athleteId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { addCoachPlan } = useAppData()
  const athlete = getAthlete(athleteId)
  const prefill = location.state?.prefill

  const [name, setName] = useState(prefill?.name ?? '')
  const [exercises, setExercises] = useState(() =>
    prefill?.exercises?.length ? toEditable(prefill.exercises) : [blankExercise()],
  )
  const [schedule, setSchedule] = useState(() => normalizeSchedule(null))

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

  const handleSave = () => {
    const cleaned = exercises
      .filter((e) => e.name.trim())
      .map((e) =>
        isCardio(e.name)
          ? {
              id: e.id,
              name: e.name,
              type: 'cardio',
              minutes: e.minutes === '' ? null : Number(e.minutes),
              intensity: e.intensity || null,
              notes: e.notes.trim(),
            }
          : {
              id: e.id,
              name: e.name,
              sets: e.sets === '' ? null : Number(e.sets),
              reps: e.reps === '' ? null : Number(e.reps),
              notes: e.notes.trim(),
            },
      )
    addCoachPlan(athleteId, {
      name: name.trim(),
      exercises: cleaned,
      schedule,
    })
    navigate(`/coach/${athleteId}`)
  }

  return (
    <div>
      <PageHeader
        icon="🧑‍🏫"
        title="Custom Plan"
        subtitle={athlete ? `For ${athlete.name}` : 'For your athlete'}
      />

      <label className={styles.nameField}>
        <span className={styles.nameLabel}>Plan name</span>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="e.g. Weeks 1–4 Base"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
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

      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={() => navigate(`/coach/${athleteId}`)}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Save plan
        </Button>
      </div>
    </div>
  )
}
