const MINUS = '\u2212' // typographic minus for nicer display

export function formatKcal(value, locale = 'en') {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    Math.round(value),
  )
}

export function formatSignedKcal(value, locale = 'en') {
  const n = Math.round(value)
  const sign = n > 0 ? '+' : n < 0 ? MINUS : ''
  return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.abs(n))}`
}

export function formatWeight(kg, locale = 'en') {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(kg)
}

export function formatSignedWeight(kg, locale = 'en') {
  const sign = kg > 0 ? '+' : kg < 0 ? MINUS : ''
  return `${sign}${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Math.abs(kg))}`
}

export function formatDayLong(date, locale = 'en') {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDayMedium(date, locale = 'en') {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

export function formatWeekdayShort(date, locale = 'en') {
  return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
}

export function formatWeekLabel(start, end, locale = 'en') {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' })
  const yearFmt = new Intl.DateTimeFormat(locale, { year: 'numeric' })
  const sameYear = start.getFullYear() === end.getFullYear()
  const yearPart = sameYear
    ? yearFmt.format(start)
    : `${yearFmt.format(start)}\u2013${yearFmt.format(end)}`
  return `${fmt.format(start)} \u2013 ${fmt.format(end)}, ${yearPart}`
}
