// Strength exercises (logged as sets × reps × weight), in display order.
export const EXERCISES = [
  'Bench Press (bar)',
  'Bench Press (free weights)',
  'Shoulder Press',
  'Lat Pulldown',
  'Bicep Curl',
  'Single Arm Row',
  'Leg Press (1 leg)',
  'Leg Press (2 legs)',
  'Leg Curls',
  'Squat',
  'Hip Thrust',
  'Romanian Deadlift',
  'Cable Rotation',
  'Hang',
  'Plank Drag',
  'Back Extension',
]

// Warm-up / cardio exercises (logged as minutes + intensity, not sets/reps).
export const CARDIO_EXERCISES = ['Running', 'Cycling', 'Rowing', 'Elliptical', 'Jump Rope']

// Intensity options for cardio.
export const INTENSITIES = ['Low', 'Medium', 'High']

// Grouped options for the exercise dropdowns (strength + cardio).
export const EXERCISE_GROUPS = [
  { label: 'Exercises', options: EXERCISES },
  { label: 'Warm-up / Cardio', options: CARDIO_EXERCISES },
]

export const ALL_EXERCISES = [...EXERCISES, ...CARDIO_EXERCISES]

// Whether an exercise is a cardio/warm-up type (minutes + intensity).
export function isCardio(name) {
  return CARDIO_EXERCISES.includes(name)
}
