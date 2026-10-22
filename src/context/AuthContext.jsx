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
// Set just before an OAuth redirect so we can log the sign-in once we return.
const PENDING_SIGNIN_KEY = 'chriscross.pendingSignIn'

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

// Record a sign-in / sign-out in Supabase. Best-effort: a logging failure must
// never block authentication. user_id is filled by the column's auth.uid()
// default, so this must run while the session's JWT is still active.
async function logAuthEvent(event) {
  if (!isSupabaseConfigured) return
  try {
    await supabase.from('auth_events').insert({ event })
  } catch {
    // ignore — auth must still work even if the audit insert fails
  }
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
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setLoading(false)
      // If we just came back from an OAuth redirect, log that sign-in once.
      if (sessionUser && localStorage.getItem(PENDING_SIGNIN_KEY)) {
        localStorage.removeItem(PENDING_SIGNIN_KEY)
        logAuthEvent('sign_in')
      }
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
  const signInWithPassword = async (email, password) => {
    if (DEV_MODE) return devSignIn(email)
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (!res.error && res.data?.session) await logAuthEvent('sign_in')
    return res
  }

  const signUpWithPassword = async (email, password) => {
    if (DEV_MODE) return devSignIn(email)
    const res = await supabase.auth.signUp({ email, password })
    // A session only exists immediately when email confirmation is off;
    // otherwise the sign-in is logged when the user later signs in.
    if (!res.error && res.data?.session) await logAuthEvent('sign_in')
    return res
  }

  const signInWithGoogle = async () => {
    if (DEV_MODE) return devSignIn('dev@local')
    // Mark the pending sign-in so we can log it after the OAuth redirect.
    localStorage.setItem(PENDING_SIGNIN_KEY, '1')
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    if (res.error) localStorage.removeItem(PENDING_SIGNIN_KEY)
    return res
  }

  const signOut = async () => {
    if (DEV_MODE) {
      localStorage.removeItem(DEV_USER_KEY)
      setUser(null)
      return { error: null }
    }
    // Log before signing out, while the session JWT is still valid.
    await logAuthEvent('sign_out')
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
