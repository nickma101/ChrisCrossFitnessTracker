import { WEEKDAYS, todayCode } from './weekdays.js'

// A plan's schedule supports three modes:
//   days     — specific weekdays, e.g. { type:'days', days:['Mon','Wed'] }
//   weekly   — a frequency target, e.g. { type:'weekly', timesPerWeek: 3 }
//   interval — every X days,       e.g. { type:'interval', everyDays: 2 }
export const SCHEDULE_TYPES = [
  { value: 'days', label: 'Days' },
  { value: 'weekly', label: 'Per week' },
  { value: 'interval', label: 'Every X days' },
]

const DEFAULTS = { type: 'days', days: [], timesPerWeek: 3, everyDays: 2 }

// Accepts the current object form, the legacy array form (weekday codes), or
// null, and always returns a complete, well-formed schedule object.
export function normalizeSchedule(raw) {
  if (Array.isArray(raw)) return { ...DEFAULTS, type: 'days', days: raw }
  if (raw && typeof raw === 'object') return { ...DEFAULTS, ...raw }
  return { ...DEFAULTS }
}

// True when this schedule carries a meaningful value worth displaying.
export function hasSchedule(raw) {
  const s = normalizeSchedule(raw)
  if (s.type === 'days') return s.days.length > 0
  return true // weekly / interval always represent a cadence
}

// Short human description, used on badges/labels.
export function describeSchedule(raw) {
  const s = normalizeSchedule(raw)
  if (s.type === 'weekly') return `${s.timesPerWeek}× / week`
  if (s.type === 'interval')
    return `Every ${s.everyDays} ${s.everyDays === 1 ? 'day' : 'days'}`
  return s.days.length ? s.days.join(', ') : null
}

function startOfDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Whether a plan falls on "today". Day schedules match the weekday; interval
// schedules count from the plan's creation date; weekly schedules have no
// fixed day, so they never pin to a specific day.
export function isScheduledToday(plan, now = new Date()) {
  const s = normalizeSchedule(plan?.schedule)
  if (s.type === 'days') return s.days.includes(todayCode(now))
  if (s.type === 'interval' && plan?.createdAt && s.everyDays > 0) {
    const days = Math.round(
      (startOfDay(now.getTime()) - startOfDay(plan.createdAt)) / 86400000,
    )
    return days >= 0 && days % s.everyDays === 0
  }
  return false
}

// Returns the schedule as day chips (for 'days') or a single descriptive chip.
export function scheduleChips(raw) {
  const s = normalizeSchedule(raw)
  if (s.type === 'days') {
    const order = WEEKDAYS.map((d) => d.code)
    return s.days.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }
  const label = describeSchedule(s)
  return label ? [label] : []
}
