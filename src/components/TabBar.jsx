import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './TabBar.module.css'

const TABS = [
  { to: '/workout', icon: '🏋️', label: 'Workout' },
  { to: '/mytraining', icon: '📋', label: 'MyTraining' },
  { to: '/history', icon: '🗓️', label: 'History' },
  { to: '/progress', icon: '📈', label: 'Progress' },
  // Coach is admin-only.
  { to: '/coach', icon: '🧑‍🏫', label: 'Coach', adminOnly: true },
]

export default function TabBar() {
  const { isAdmin } = useAuth()
  const tabs = TABS.filter((tab) => !tab.adminOnly || isAdmin)

  return (
    <nav className={`${styles.bar} ${styles[`cols${tabs.length}`]}`} aria-label="Main">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `${styles.tab} ${isActive ? styles.active : ''}`.trim()
          }
        >
          <span className={styles.icon} aria-hidden="true">
            {tab.icon}
          </span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
