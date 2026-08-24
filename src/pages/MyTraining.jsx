import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Button from '../components/Button.jsx'
import PlanCard from '../components/PlanCard.jsx'
import { usePlans } from '../context/TrainingPlansContext.jsx'
import { useAppData } from '../context/AppDataContext.jsx'
import { parsePlanFromFile, downloadTemplate } from '../lib/excel.js'
import styles from './MyTraining.module.css'

export default function MyTraining() {
  const navigate = useNavigate()
  const { plans, loading, deletePlan } = usePlans()
  const { goals, updateGoals } = useAppData()
  const fileRef = useRef(null)
  const [importError, setImportError] = useState('')

  const handleDelete = (plan) => {
    if (window.confirm(`Delete "${plan.name}"? This can't be undone.`)) {
      deletePlan(plan.id)
    }
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    setImportError('')
    try {
      const prefill = await parsePlanFromFile(file)
      // Drop the user into the editor with the imported plan pre-filled.
      navigate('/mytraining/new', { state: { prefill } })
    } catch (err) {
      setImportError(err.message ?? 'Could not read that file.')
    }
  }

  return (
    <div>
      <PageHeader
        icon="📋"
        title="MyTraining"
        subtitle="Design your plans, schedules and goals"
      />

      <section className={styles.goalCard}>
        <div className={styles.goalText}>
          <h3 className={styles.goalTitle}>Weekly goal</h3>
          <p className={styles.goalSub}>Target workouts per week</p>
        </div>
        <div className={styles.stepper}>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() =>
              updateGoals({ weeklyWorkoutGoal: Math.max(1, goals.weeklyWorkoutGoal - 1) })
            }
            aria-label="Decrease goal"
          >
            −
          </button>
          <span className={styles.stepValue}>{goals.weeklyWorkoutGoal}</span>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={() =>
              updateGoals({ weeklyWorkoutGoal: Math.min(14, goals.weeklyWorkoutGoal + 1) })
            }
            aria-label="Increase goal"
          >
            +
          </button>
        </div>
      </section>

      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Plans</h2>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading your plans…</p>
      ) : plans.length === 0 ? (
        <EmptyState
          icon="🧩"
          message="No plans yet. Create one from scratch or import an Excel plan."
          action={
            <Button onClick={() => navigate('/mytraining/new')}>＋ New plan</Button>
          }
        />
      ) : (
        <div className={styles.list}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button className={styles.fullBtn} onClick={() => navigate('/mytraining/new')}>
          ＋ New plan
        </Button>
        <div className={styles.importRow}>
          <Button
            variant="secondary"
            className={styles.importBtn}
            onClick={() => fileRef.current?.click()}
          >
            ⬆ Import Excel
          </Button>
          <Button
            variant="ghost"
            className={styles.importBtn}
            onClick={downloadTemplate}
          >
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
    </div>
  )
}
