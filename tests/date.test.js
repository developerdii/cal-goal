import { describe, it, expect } from 'vitest'
import { toDateKey, parseDateKey, addDays, getWeekDays, startOfDay, isFutureDay } from '@/utils/date'

describe('date utils', () => {
  it('formats a date to a local YYYY-MM-DD key', () => {
    expect(toDateKey(new Date(2026, 8, 7))).toBe('2026-09-07')
  })

  it('parses a date key back to a local date', () => {
    const d = parseDateKey('2026-09-07')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(8)
    expect(d.getDate()).toBe(7)
  })

  it('adds days across month boundaries', () => {
    expect(toDateKey(addDays(new Date(2026, 8, 7), 1))).toBe('2026-09-08')
    expect(toDateKey(addDays(new Date(2026, 8, 7), -1))).toBe('2026-09-06')
    // July 31 -> Aug 1 crosses a month boundary (month is 0-indexed: 6 = July)
    expect(toDateKey(addDays(new Date(2026, 6, 31), 1))).toBe('2026-08-01')
  })

  it('starts the week on Monday', () => {
    // Sep 7 2026 is a Monday
    const days = getWeekDays(new Date(2026, 8, 7))
    expect(days).toHaveLength(7)
    expect(toDateKey(days[0])).toBe('2026-09-07')
    expect(toDateKey(days[6])).toBe('2026-09-13')
  })

  it('rolls a mid-week date back to its Monday', () => {
    // Sep 9 2026 is a Wednesday
    const days = getWeekDays(new Date(2026, 8, 9))
    expect(toDateKey(days[0])).toBe('2026-09-07')
    expect(toDateKey(days[2])).toBe('2026-09-09')
  })

  it('rolls a Sunday back to the same week Monday', () => {
    // Sep 13 2026 is a Sunday
    const days = getWeekDays(new Date(2026, 8, 13))
    expect(toDateKey(days[0])).toBe('2026-09-07')
    expect(toDateKey(days[6])).toBe('2026-09-13')
  })

  it('normalizes to the start of day', () => {
    const d = startOfDay(new Date(2026, 8, 7, 23, 59, 59, 999))
    expect(d.getHours()).toBe(0)
    expect(d.getMinutes()).toBe(0)
    expect(toDateKey(d)).toBe('2026-09-07')
  })

  it('detects future days relative to a reference date', () => {
    expect(isFutureDay(new Date(2026, 8, 8), '2026-09-07')).toBe(true)
    expect(isFutureDay(new Date(2026, 8, 7), '2026-09-07')).toBe(false)
    expect(isFutureDay(new Date(2026, 8, 6), '2026-09-07')).toBe(false)
  })
})
