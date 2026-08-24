import { makeId } from './storage.js'

// xlsx is heavy (~600 kB), so it's loaded on demand — only when the user
// actually imports a file or downloads the template — keeping it out of the
// main bundle.
const loadXLSX = () => import('xlsx')

// Standard import template columns. Keep these in sync with the header row
// written by downloadTemplate() below.
const COLUMNS = ['Exercise', 'Sets', 'Target Reps', 'Notes']

// Case/space-insensitive lookup so slightly different headers still import.
function pick(row, ...keys) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z]/g, '')
  const wanted = keys.map(norm)
  const found = Object.keys(row).find((k) => wanted.includes(norm(k)))
  return found ? row[found] : undefined
}

function toNumber(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// Parses an .xlsx/.csv file into a plan draft: { name, exercises: [...] }.
// The plan name defaults to the file name (minus extension).
export async function parsePlanFromFile(file) {
  const XLSX = await loadXLSX()
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) throw new Error('The file has no sheets to read.')

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  const exercises = rows
    .map((row) => ({
      id: makeId(),
      name: String(pick(row, 'Exercise', 'Name') ?? '').trim(),
      sets: toNumber(pick(row, 'Sets')),
      reps: toNumber(pick(row, 'Target Reps', 'Reps')),
      notes: String(pick(row, 'Notes') ?? '').trim(),
    }))
    .filter((e) => e.name)

  if (exercises.length === 0) {
    throw new Error(
      'No exercises found. Make sure the first sheet has an "Exercise" column.',
    )
  }

  const name = file.name.replace(/\.[^.]+$/, '').trim() || 'Imported Plan'
  return { name, exercises }
}

// Builds and downloads a blank .xlsx PLAN template the user can fill in.
export async function downloadTemplate() {
  const XLSX = await loadXLSX()
  const example = [
    ['Bench Press (bar)', 4, 8, 'Controlled tempo'],
    ['Lat Pulldown', 3, 10, ''],
    ['Squat', 3, 12, 'Depth below parallel'],
  ]
  const ws = XLSX.utils.aoa_to_sheet([COLUMNS, ...example])
  ws['!cols'] = [{ wch: 26 }, { wch: 8 }, { wch: 12 }, { wch: 30 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Training Plan')
  XLSX.writeFile(wb, 'crisscross-plan-template.xlsx')
}

// --- Workout logging via Excel ------------------------------------------

// Columns for the WORKOUT logging template: one row per performed set.
const WORKOUT_COLUMNS = ['Exercise', 'Reps', 'Weight', 'Date']

function todayStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Turns a Date cell / date string into a local-noon timestamp, or null.
function parseDateCell(v) {
  if (v == null || v === '') return null
  if (v instanceof Date) {
    return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 12).getTime()
  }
  const t = Date.parse(String(v))
  if (Number.isNaN(t)) return null
  const d = new Date(t)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime()
}

// Parses an .xlsx/.csv file (one row per set) into a logged workout:
// { name, performedAt, entries: [{ exerciseName, sets: [{reps, weight}] }] }.
// Rows are grouped by exercise in first-seen order. The workout name defaults
// to the file name; the date comes from the first filled Date cell, else today.
export async function parseWorkoutFromFile(file) {
  const XLSX = await loadXLSX()
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) throw new Error('The file has no sheets to read.')

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  let performedAt = null
  const order = []
  const byExercise = new Map()

  for (const row of rows) {
    if (performedAt == null) {
      const parsed = parseDateCell(pick(row, 'Date'))
      if (parsed) performedAt = parsed
    }
    const name = String(pick(row, 'Exercise', 'Name') ?? '').trim()
    if (!name) continue
    const reps = toNumber(pick(row, 'Reps'))
    const weight = toNumber(pick(row, 'Weight'))
    if (reps == null && weight == null) continue // skip empty set rows
    if (!byExercise.has(name)) {
      byExercise.set(name, [])
      order.push(name)
    }
    byExercise.get(name).push({ reps, weight })
  }

  const entries = order.map((name) => ({
    exerciseName: name,
    sets: byExercise.get(name),
  }))

  if (entries.length === 0) {
    throw new Error(
      'No sets found. Add rows with an "Exercise" and a Reps or Weight value.',
    )
  }

  const name = file.name.replace(/\.[^.]+$/, '').trim() || 'Workout'
  return { name, performedAt: performedAt ?? Date.now(), entries }
}

// Builds and downloads a blank .xlsx WORKOUT logging template.
export async function downloadWorkoutTemplate() {
  const XLSX = await loadXLSX()
  const example = [
    ['Bench Press (bar)', 8, 60, todayStr()],
    ['Bench Press (bar)', 8, 62, ''],
    ['Bench Press (bar)', 6, 65, ''],
    ['Squat', 5, 100, ''],
    ['Squat', 5, 105, ''],
  ]
  const ws = XLSX.utils.aoa_to_sheet([WORKOUT_COLUMNS, ...example])
  ws['!cols'] = [{ wch: 26 }, { wch: 8 }, { wch: 10 }, { wch: 14 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Workout')
  XLSX.writeFile(wb, 'crisscross-workout-template.xlsx')
}
