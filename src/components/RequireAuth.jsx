import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './RequireAuth.module.css'

// Gates the app behind a signed-in session. While the session is still
// resolving we show a lightweight splash instead of flashing the login page.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className={styles.splash}>
        <span className={styles.mark}>✕</span>
        <span className={styles.text}>Loading…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
