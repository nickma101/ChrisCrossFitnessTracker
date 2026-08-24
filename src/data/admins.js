// Emails granted admin access. Admins are the only users who can see and open
// the Coach tab. Add a second admin by uncommenting / adding their email below.
export const ADMIN_EMAILS = [
  'nicolas.mattis@gmx.de',
  // Add another admin email here later, e.g.:
  // 'second.admin@example.com',
]

// Case-insensitive membership check.
export function isAdminEmail(email) {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return ADMIN_EMAILS.some((e) => e.trim().toLowerCase() === normalized)
}
