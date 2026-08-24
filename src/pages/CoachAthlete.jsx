import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import ScheduleBadge from '../components/ScheduleBadge.jsx'
import StatsPanel from '../components/StatsPanel.jsx'
import { getAthlete } from '../data/coachAthletes.js'
import { useAppData } from '../context/AppDataContext.jsx'
import { parsePlanFromFile, downloadTemplate } from '../lib/excel.js'
import styles from './CoachAthlete.module.css'

function formatDate(ms) {
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// Read-only plan card (coach view of an athlete's plan).
function ReadonlyPlan({ plan, custom }) {
  const count = plan.exercises?.length ?? 0
  return (
    <div className={styles.plan}>
      {custom && <span className={styles.customTag}>Custom</span>}
      <div className={styles.planTop}>
        <h3 className={styles.planName}>{plan.name}</h3>
        <span className={styles.planCount}>
          {count} {count === 1 ? 'exercise' : 'exercises'}
        </span>
      </div>
      {count > 0 && (
        <p className={styles.planPreview}>
          {plan.exercises.map((e) => e.name).join(' · ')}
        </p>
      )}
      <ScheduleBadge schedule={plan.schedule} />
    </div>
  )
}

export default function CoachAthlete() {
  const { athleteId } = useParams()
  const navigate = useNavigate()
  const { getCoachPlans } = useAppData()
  const fileRef = useRef(null)
  const [importError, setImportError] = useState('')

  const athlete = getAthlete(athleteId)

  const recent = useMemo(
    () =>
      [...(athlete?.sessions ?? [])]
        .sort((a, b) => b.performedAt - a.performedAt)
        .slice(0, 5),
    [athlete],
  )

  if (!athlete) {
    return (
      <div>
        <PageHeader icon="🧑‍🏫" title="Coach" />
        <EmptyState
          icon="🤔"
          message="Athlete not found."
          action={<Button onClick={() => navigate('/coach')}>Back to Coach</Button>}
        />
      </div>
    )
  }

  const customPlans = getCoachPlans(athleteId)
  const pct =
    athlete.weeklyGoal > 0
      ? Math.min(100, Math.round((athlete.thisWeek / athlete.weeklyGoal) * 100))
      : 0

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImportError('')
    try {
      const prefill = await parsePlanFromFile(file)
      // Review + set schedule in the editor before assigning.
      navigate(`/coach/${athleteId}/new`, { state: { prefill } })
    } catch (err) {
      setImportError(err.message ?? 'Could not read that file.')
    }
  }

  return (
    <div>
      <PageHeader icon={athlete.avatar} title={athlete.name} subtitle={athlete.focus} />

      {/* 1. Progress bar */}
      <section className={styles.progressCard}>
        <div className={styles.progressTop}>
          <span>This week</span>
          <span className={styles.progressCount}>
            {athlete.thisWeek} / {athlete.weeklyGoal} workouts
          </span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      </section>

      {/* 2. Assigned trainings */}
      <h2 className={styles.sectionTitle}>Assigned plans</h2>
      {athlete.plans.length === 0 && customPlans.length === 0 ? (
        <EmptyState icon="🧩" message="No plans assigned yet. Create or upload one below." />
      ) : (
        <div className={styles.list}>
          {customPlans.map((plan) => (
            <ReadonlyPlan key={plan.id} plan={plan} custom />
          ))}
          {athlete.plans.map((plan) => (
            <ReadonlyPlan key={plan.id} plan={plan} />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          className={styles.fullBtn}
          onClick={() => navigate(`/coach/${athleteId}/new`)}
        >
          ＋ Create custom plan
        </Button>
        <div className={styles.importRow}>
          <Button
            variant="secondary"
            className={styles.importBtn}
            onClick={() => fileRef.current?.click()}
          >
            ⬆ Upload Excel plan
          </Button>
          <Button variant="ghost" className={styles.importBtn} onClick={downloadTemplate}>
            Download template
          </Button>
        </div>
        {importError && <p className={styles.importError}>{importError}</p>}
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          hidden
        />
      </div>

      {/* 3. Progress statistics (same panel the athlete sees) */}
      <h2 className={styles.sectionTitle}>Progress statistics</h2>
      <div className={styles.statsWrap}>
        <StatsPanel sessions={athlete.sessions ?? []} />
      </div>

      {/* 4. Recent workouts (up to 5) */}
      <h2 className={styles.sectionTitle}>Recent workouts</h2>
      {recent.length === 0 ? (
        <EmptyState icon="🗓️" message="No workouts logged yet." />
      ) : (
        <div className={styles.list}>
          {recent.map((s) => {
            const setCount = (s.entries ?? []).reduce(
              (n, e) => n + (e.sets?.length ?? 0),
              0,
            )
            return (
              <div key={s.id} className={styles.workoutRow}>
                <div className={styles.workoutInfo}>
                  <h3 className={styles.workoutName}>{s.planName}</h3>
                  <p className={styles.workoutMeta}>
                    {formatDate(s.performedAt)} · {setCount}{' '}
                    {setCount === 1 ? 'set' : 'sets'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
