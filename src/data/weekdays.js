// Weekday model used for plan schedules. Stored as short codes on a plan's
// `schedule` array, e.g. ['Mon', 'Wed', 'Fri'].
export const WEEKDAYS = [
  { code: 'Mon', label: 'Mon' },
  { code: 'Tue', label: 'Tue' },
  { code: 'Wed', label: 'Wed' },
  { code: 'Thu', label: 'Thu' },
  { code: 'Fri', label: 'Fri' },
  { code: 'Sat', label: 'Sat' },
  { code: 'Sun', label: 'Sun' },
]

// Map JS Date.getDay() (0=Sun..6=Sat) to our Mon-first codes.
const JS_DAY_TO_CODE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function todayCode(date = new Date()) {
  return JS_DAY_TO_CODE[date.getDay()]
}
