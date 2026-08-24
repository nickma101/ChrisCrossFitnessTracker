import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import TabBar from './TabBar.jsx'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut, isDevMode } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Sub-pages (plan editor, workout session, athlete detail) have more than
  // one path segment and get a back button instead of the brand-only header.
  const isSubPage = pathname.split('/').filter(Boolean).length > 1

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        {isSubPage && (
          <button
            type="button"
            className={styles.back}
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            ←
          </button>
        )}
        <Link to="/workout" className={styles.brand}>
          <span className={styles.brandMark}>✕</span>
          ChrisCross
        </Link>
        {isDevMode && (
          <span className={styles.devBadge} title="Local data — Supabase not connected">
            DEV
          </span>
        )}
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle dark or light mode"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {user && (
          <button
            type="button"
            className={styles.signOut}
            onClick={signOut}
            title={user.email}
          >
            Sign out
          </button>
        )}
      </header>

      <main className={styles.main}>{children}</main>

      <TabBar />
    </div>
  )
}
