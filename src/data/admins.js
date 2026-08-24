// Admin emails come from the VITE_ADMIN_EMAILS env var (comma-separated), so
// no personal address is hardcoded in the source. Set it in .env locally and in
// your host's env vars (e.g. Vercel) for production. Admins are the only users
// who can see and open the Coach tab.
//
// Example .env line:
//   VITE_ADMIN_EMAILS=someone@example.com,second.admin@example.com
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

// Case-insensitive membership check.
export function isAdminEmail(email) {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
