import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Gates admin-only routes (Coach). Non-admins who navigate here directly are
// bounced back to the Workout tab.
export default function RequireAdmin({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/workout" replace />
  return children
}
