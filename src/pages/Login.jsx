import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Login.module.css'

export default function Login() {
  const {
    user,
    isDevMode,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
  } = useAuth()

  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in — bounce to the home page.
  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    const fn = mode === 'signin' ? signInWithPassword : signUpWithPassword
    const { data, error: err } = await fn(email.trim(), password)
    setBusy(false)

    if (err) {
      setError(err.message)
      return
    }
    // Sign-up with email confirmation returns a user but no session yet.
    if (mode === 'signup' && !data.session) {
      setNotice('Check your email to confirm your account, then sign in.')
      setMode('signin')
    }
  }

  const handleGoogle = async () => {
    setError('')
    const { error: err } = await signInWithGoogle()
    if (err) setError(err.message)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.brand}>
        <span className={styles.mark}>✕</span>
        <span className={styles.brandName}>ChrisCross</span>
      </div>
      <h1 className={styles.title}>
        {mode === 'signin' ? 'Welcome back' : 'Create your account'}
      </h1>
      <p className={styles.subtitle}>
        {mode === 'signin'
          ? 'Sign in to track your training.'
          : 'Sign up to start tracking your training.'}
      </p>

      {isDevMode && (
        <div className={styles.devNotice}>
          <strong>Developer mode.</strong> Supabase isn&apos;t connected, so
          sign in with <em>any</em> email &amp; password — a local account is
          used and data is saved in your browser. Add your
          <code> .env</code> keys to switch to the real backend.
        </div>
      )}

      <Button
        variant="secondary"
        className={styles.googleBtn}
        onClick={handleGoogle}
        disabled={busy}
      >
        <span className={styles.googleG} aria-hidden="true">G</span>
        {isDevMode ? 'Continue as developer' : 'Continue with Google'}
      </Button>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Password</span>
          <input
            className={styles.input}
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {mode === 'signup' && (
          <label className={styles.field}>
            <span className={styles.label}>Confirm password</span>
            <input
              className={styles.input}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}

        <Button type="submit" disabled={busy}>
          {busy
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : 'Sign up'}
        </Button>
      </form>

      <p className={styles.switch}>
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          className={styles.switchBtn}
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError('')
            setNotice('')
            setConfirmPassword('')
          }}
        >
          {mode === 'signin' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
