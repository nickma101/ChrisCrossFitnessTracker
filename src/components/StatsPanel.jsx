import { useMemo, useState } from 'react'
import { computeStats, prevMonthRange, past30Range } from '../lib/stats.js'
import styles from './StatsPanel.module.css'

const WINDOWS = [
  { key: 'month', label: 'Last month' },
  { key: '30days', label: 'Past 30 days' },
]

// The progress statistics shown on MyProgress — reused verbatim in the Coach
// athlete view so a coach sees exactly what the athlete sees.
export default function StatsPanel({ sessions }) {
  const [window, setWindow] = useState('month')

  const stats = useMemo(() => {
    const range = window === 'month' ? prevMonthRange() : past30Range()
    return computeStats(sessions, range)
  }, [sessions, window])

  return (
    <div>
      <div className={styles.tabs}>
        {WINDOWS.map((w) => (
          <button
            key={w.key}
            type="button"
            className={`${styles.tab} ${window === w.key ? styles.tabOn : ''}`.trim()}
            onClick={() => setWindow(w.key)}
            aria-pressed={window === w.key}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Number of workouts</span>
          <span className={styles.statValue}>{stats.workouts}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>
            Favourite exercise{stats.favourites.length > 1 ? 's' : ''}
          </span>
          <span className={styles.statValue}>
            {stats.favourites.length === 0 ? (
              <span className={styles.muted}>—</span>
            ) : (
              <span className={styles.favWrap}>
                {stats.favourites.map((name) => (
                  <span key={name} className={styles.favChip}>
                    {name}
                  </span>
                ))}
              </span>
            )}
          </span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.statLabel}>Biggest improvement</span>
          <span className={styles.statValue}>
            {stats.biggestImprovement ? (
              <span className={styles.improve}>
                {stats.biggestImprovement.exercise}{' '}
                <span
                  className={
                    stats.biggestImprovement.pct >= 0 ? styles.up : styles.down
                  }
                >
                  {stats.biggestImprovement.pct >= 0 ? '+' : ''}
                  {stats.biggestImprovement.pct.toFixed(0)}%
                </span>
              </span>
            ) : (
              <span className={styles.muted}>—</span>
            )}
          </span>
        </div>
        {stats.biggestImprovement && (
          <p className={styles.improveNote}>
            {stats.biggestImprovement.refMax}kg → {stats.biggestImprovement.latestMax}kg
            (max weight, reference → latest)
          </p>
        )}
      </div>
    </div>
  )
}
