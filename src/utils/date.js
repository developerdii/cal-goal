// Local-time, timezone-safe date helpers. All keys are "YYYY-MM-DD" local dates.

export function toDateKey(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function isSameDay(a, b) {
  return toDateKey(a) === toDateKey(b)
}

// Returns the 7 dates (Mon..Sun) of the week containing `anchor`.
export function getWeekDays(anchor) {
  const start = startOfDay(anchor)
  const jsDay = start.getDay() // 0 = Sunday, 6 = Saturday
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay
  const monday = addDays(start, diffToMonday)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

// True if `date` is strictly after `todayKey` (default: now, in local time).
// Date keys are zero-padded "YYYY-MM-DD", so a plain string comparison works.
export function isFutureDay(date, todayKey = toDateKey(new Date())) {
  return toDateKey(date) > todayKey
}
