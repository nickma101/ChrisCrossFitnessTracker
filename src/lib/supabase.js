import { createClient } from '@supabase/supabase-js'

// Credentials come from Vite env vars (see .env.example). The anon key is
// safe to ship in the frontend — Row-Level Security is what protects data.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Treat the app as configured only when BOTH values are present AND look real —
// not the placeholders shipped in .env.example. Anything else (missing file,
// unedited placeholders) falls back to developer mode instead of pointing the
// client at a bogus host.
function looksConfigured(u, k) {
  if (!u || !k) return false
  if (!/^https:\/\/.+\.supabase\.co\/?$/.test(u)) return false
  if (u.includes('YOUR-PROJECT')) return false
  if (k === 'your-anon-public-key' || k.length < 20) return false
  return true
}

export const isSupabaseConfigured = looksConfigured(url, anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
