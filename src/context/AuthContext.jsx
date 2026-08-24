import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { isAdminEmail } from '../data/admins.js'

const AuthContext = createContext(null)

// DEVELOPER MODE is active whenever Supabase isn't configured. It provides a
// fake, locally-persisted session so the app is fully usable without a backend.
// The moment real VITE_SUPABASE_* keys are added, this path is bypassed
// entirely and the real Supabase auth below takes over — no code changes.
const DEV_MODE = !isSupabaseConfigured
const DEV_USER_KEY = 'crisscross.devUser'

function loadDevUser() {
  try {
    const raw = localStorage.getItem(DEV_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function makeDevUser(email) {
  return { id: 'dev-user', email: email || 'dev@local', isDev: true }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only "load" a session when there's a real backend to ask.
  const [loading, setLoading] = useState(!DEV_MODE)

  useEffect(() => {
    if (DEV_MODE) {
      setUser(loadDevUser())
      return
    }

    // Hydrate the current session, then keep it in sync with auth changes
    // (sign in/out, token refresh, OAuth redirect back to the app).
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  // --- Dev-mode auth: accept anything, persist locally --------------------
  const devSignIn = (email) => {
    const devUser = makeDevUser(email)
    localStorage.setItem(DEV_USER_KEY, JSON.stringify(devUser))
    setUser(devUser)
    return { data: { session: { user: devUser } }, error: null }
  }

  // --- Real Supabase auth --------------------------------------------------
  const signInWithPassword = (email, password) =>
    DEV_MODE
      ? devSignIn(email)
      : supabase.auth.signInWithPassword({ email, password })

  const signUpWithPassword = (email, password) =>
    DEV_MODE
      ? devSignIn(email)
      : supabase.auth.signUp({ email, password })

  const signInWithGoogle = () =>
    DEV_MODE
      ? devSignIn('dev@local')
      : supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + window.location.pathname,
          },
        })

  const signOut = () => {
    if (DEV_MODE) {
      localStorage.removeItem(DEV_USER_KEY)
      setUser(null)
      return Promise.resolve({ error: null })
    }
    return supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    isConfigured: isSupabaseConfigured,
    isDevMode: DEV_MODE,
    isAdmin: isAdminEmail(user?.email),
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
