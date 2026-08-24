// Mock athletes for the Coach tab. In developer mode there's only one real
// user, so these sample individuals demonstrate the coaching flows (viewing
// someone's plans/progress/history and building custom plans for them). When
// real multi-user Supabase auth is added, this is replaced by actual data.
const DAY = 86400000
const daysAgo = (n) => Date.now() - n * DAY

export const ATHLETES = [
  {
    id: 'ath-1',
    name: 'Jordan Lee',
    avatar: '🏃',
    focus: 'Strength · 4×/week',
    weeklyGoal: 4,
    thisWeek: 3,
    plans: [
      {
        id: 'ath1-plan1',
        name: 'Upper Power',
        schedule: ['Mon', 'Thu'],
        exercises: [
          { id: 'a1p1e1', name: 'Bench Press (bar)', sets: 5, reps: 5, notes: '' },
          { id: 'a1p1e2', name: 'Single Arm Row', sets: 4, reps: 6, notes: '' },
          { id: 'a1p1e3', name: 'Lat Pulldown', sets: 3, reps: 8, notes: '' },
        ],
      },
    ],
    // Progressive bench press so the stats have a clear "biggest improvement".
    sessions: [
      { id: 'j-s1', planName: 'Upper Power', performedAt: daysAgo(40), entries: [
        { exerciseName: 'Bench Press (bar)', sets: [{ reps: 5, weight: 80 }, { reps: 5, weight: 80 }] },
        { exerciseName: 'Single Arm Row', sets: [{ reps: 8, weight: 30 }] },
      ] },
      { id: 'j-s2', planName: 'Upper Power', performedAt: daysAgo(33), entries: [
        { exerciseName: 'Bench Press (bar)', sets: [{ reps: 5, weight: 82.5 }] },
        { exerciseName: 'Lat Pulldown', sets: [{ reps: 10, weight: 55 }] },
      ] },
      { id: 'j-s3', planName: 'Upper Power', performedAt: daysAgo(26), entries: [
        { exerciseName: 'Bench Press (bar)', sets: [{ reps: 5, weight: 85 }] },
        { exerciseName: 'Single Arm Row', sets: [{ reps: 8, weight: 32 }] },
      ] },
      { id: 'j-s4', planName: 'Upper Power', performedAt: daysAgo(12), entries: [
        { exerciseName: 'Bench Press (bar)', sets: [{ reps: 5, weight: 87.5 }] },
        { exerciseName: 'Lat Pulldown', sets: [{ reps: 10, weight: 57.5 }] },
      ] },
      { id: 'j-s5', planName: 'Upper Power', performedAt: daysAgo(5), entries: [
        { exerciseName: 'Bench Press (bar)', sets: [{ reps: 5, weight: 90 }] },
        { exerciseName: 'Single Arm Row', sets: [{ reps: 8, weight: 34 }] },
      ] },
      { id: 'j-s6', planName: 'Upper Power', performedAt: daysAgo(2), entries: [
        { exerciseName: 'Bench Press (bar)', sets: [{ reps: 5, weight: 92.5 }] },
        { exerciseName: 'Lat Pulldown', sets: [{ reps: 10, weight: 60 }] },
      ] },
    ],
  },
  {
    id: 'ath-2',
    name: 'Sam Rivera',
    avatar: '🚴',
    focus: 'Hypertrophy · 5×/week',
    weeklyGoal: 5,
    thisWeek: 5,
    plans: [
      {
        id: 'ath2-plan1',
        name: 'Leg Focus',
        schedule: ['Tue', 'Fri'],
        exercises: [
          { id: 'a2p1e1', name: 'Squat', sets: 4, reps: 8, notes: '' },
          { id: 'a2p1e2', name: 'Romanian Deadlift', sets: 3, reps: 10, notes: '' },
          { id: 'a2p1e3', name: 'Hip Thrust', sets: 3, reps: 12, notes: '' },
        ],
      },
    ],
    sessions: [
      { id: 's-s1', planName: 'Leg Focus', performedAt: daysAgo(38), entries: [
        { exerciseName: 'Squat', sets: [{ reps: 8, weight: 100 }] },
        { exerciseName: 'Hip Thrust', sets: [{ reps: 12, weight: 120 }] },
      ] },
      { id: 's-s2', planName: 'Leg Focus', performedAt: daysAgo(30), entries: [
        { exerciseName: 'Squat', sets: [{ reps: 8, weight: 105 }] },
        { exerciseName: 'Romanian Deadlift', sets: [{ reps: 10, weight: 90 }] },
      ] },
      { id: 's-s3', planName: 'Leg Focus', performedAt: daysAgo(15), entries: [
        { exerciseName: 'Squat', sets: [{ reps: 8, weight: 110 }] },
        { exerciseName: 'Hip Thrust', sets: [{ reps: 12, weight: 130 }] },
      ] },
      { id: 's-s4', planName: 'Leg Focus', performedAt: daysAgo(6), entries: [
        { exerciseName: 'Squat', sets: [{ reps: 8, weight: 115 }] },
        { exerciseName: 'Romanian Deadlift', sets: [{ reps: 10, weight: 95 }] },
      ] },
      { id: 's-s5', planName: 'Leg Focus', performedAt: daysAgo(1), entries: [
        { exerciseName: 'Squat', sets: [{ reps: 8, weight: 120 }] },
        { exerciseName: 'Hip Thrust', sets: [{ reps: 12, weight: 140 }] },
      ] },
    ],
  },
  {
    id: 'ath-3',
    name: 'Priya Nair',
    avatar: '🧗',
    focus: 'General fitness · 3×/week',
    weeklyGoal: 3,
    thisWeek: 1,
    plans: [],
    sessions: [
      { id: 'p-s1', planName: 'Full Body', performedAt: daysAgo(20), entries: [
        { exerciseName: 'Leg Press (2 legs)', sets: [{ reps: 12, weight: 140 }] },
        { exerciseName: 'Lat Pulldown', sets: [{ reps: 10, weight: 40 }] },
      ] },
      { id: 'p-s2', planName: 'Full Body', performedAt: daysAgo(3), entries: [
        { exerciseName: 'Leg Press (2 legs)', sets: [{ reps: 12, weight: 150 }] },
        { exerciseName: 'Back Extension', sets: [{ reps: 15, weight: 0 }] },
      ] },
    ],
  },
]

export function getAthlete(id) {
  return ATHLETES.find((a) => a.id === id)
}
