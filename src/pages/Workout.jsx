import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import { usePlans } from '../context/TrainingPlansContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { useActiveWorkout } from '../context/ActiveWorkoutContext.jsx'
import { describeSchedule, isScheduledToday } from '../data/schedule.js'
import { draftFromPlan, scratchDraft, loggedCount } from '../lib/workoutDraft.js'
import { parseWorkoutFromFile, downloadWorkoutTemplate } from '../lib/excel.js'
import styles from './Workout.module.css'

function PlanRow({ plan, onStart, onEdit, highlight }) {
  const count = plan.exercises?.length ?? 0
  const scheduleText = describeSchedule(plan.schedule)
  return (
    <div className={`${styles.row} ${highlight ? styles.highlight : ''}`.trim()}>
      <div className={styles.rowInfo}>
        <h3 className={styles.rowName}>{plan.name}</h3>
        <p className={styles.rowMeta}>
          {count} {count === 1 ? 'exercise' : 'exercises'}
          {scheduleText ? ` · ${scheduleText}` : ''}
        </p>
      </div>
      <div className={styles.rowActions}>
        <Button variant="ghost" className={styles.editBtn} onClick={() => onEdit(plan)}>
          Edit
        </Button>
        <Button onClick={() => onStart(plan)}>Start</Button>
      </div>
    </div>
  )
}

export default function Workout() {
  const navigate = useNavigate()
  const { plans, loading } = usePlans()
  const { logSession } = useAppData()
  const { active, startWorkout } = useActiveWorkout()
  const fileRef = useRef(null)
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)

  const scheduledToday = plans.filter((p) => isScheduledToday(p))
  const onEdit = (plan) => navigate(`/mytraining/${plan.id}/edit`)

  // Confirm before replacing an in-progress workout; otherwise resume it.
  const guardActive = (message) => {
    if (!active) return true
    if (window.confirm(message)) return true
    navigate('/workout/session')
    return false
  }

  const startPlan = (plan) => {
    if (!guardActive('You have a workout in progress. Discard it and start this plan?')) return
    startWorkout(draftFromPlan(plan))
    navigate('/workout/session')
  }

  const startScratch = () => {
    if (!guardActive('You have a workout in progress. Discard it and start a blank workout?')) return
    startWorkout(scratchDraft())
    navigate('/workout/session')
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError('')
    setImporting(true)
    try {
      const workout = await parseWorkoutFromFile(file)
      await logSession({
        planId: null,
        planName: workout.name,
        entries: workout.entries,
        performedAt: workout.performedAt,
      })
      navigate('/history')
    } catch (err) {
      setImportError(err.message ?? 'Could not read that file.')
      setImporting(false)
    }
  }

  return (
    <div>
      <PageHeader icon="🏋️" title="Workout" subtitle="Pick a plan, or log from scratch" />

      {active && (
        <section className={styles.resume}>
          <div className={styles.resumeInfo}>
            <h3 className={styles.resumeTitle}>Workout in progress</h3>
            <p className={styles.resumeMeta}>
              {active.name || 'Workout'} · {loggedCount(active.log)} logged
            </p>
          </div>
          <Button onClick={() => navigate('/workout/session')}>Resume</Button>
        </section>
      )}

      <Button variant="secondary" className={styles.scratchBtn} onClick={startScratch}>
        ＋ Log a workout from scratch
      </Button>

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : plans.length === 0 ? (
        <EmptyState
          icon="📋"
          message="No training plans yet. Head to MyTraining to create one, log from scratch above, or import a spreadsheet below."
          action={<Button onClick={() => navigate('/mytraining')}>Go to MyTraining</Button>}
        />
      ) : (
        <>
          {scheduledToday.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Scheduled today</h2>
              <div className={styles.list}>
                {scheduledToday.map((plan) => (
                  <PlanRow key={plan.id} plan={plan} onStart={startPlan} onEdit={onEdit} highlight />
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>All plans</h2>
            <div className={styles.list}>
              {plans.map((plan) => (
                <PlanRow key={plan.id} plan={plan} onStart={startPlan} onEdit={onEdit} />
              ))}
            </div>
          </section>
        </>
      )}

      <section className={styles.excelCard}>
        <div className={styles.excelText}>
          <h3 className={styles.excelTitle}>Log from a spreadsheet</h3>
          <p className={styles.excelSub}>
            Fill in the template and upload it to log a whole workout at once.
          </p>
        </div>
        <div className={styles.excelBtns}>
          <Button
            className={styles.excelBtn}
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? 'Importing…' : '⬆ Upload workout'}
          </Button>
          <Button
            variant="ghost"
            className={styles.excelBtn}
            onClick={downloadWorkoutTemplate}
            disabled={importing}
          >
            Download template
          </Button>
        </div>
        {importError && <p className={styles.excelError}>{importError}</p>}
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} hidden />
      </section>
    </div>
  )
}
