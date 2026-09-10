import { describe, it, expect } from 'vitest'
import { dailyBalance, buildWeekRows, realizedBalance, projectedWeightChange } from '@/utils/analysis'

describe('analysis utils', () => {
  it('computes daily balance as consumed - goal', () => {
    expect(dailyBalance(1700, 2000)).toBe(-300)
    expect(dailyBalance(2150, 2000)).toBe(150)
    expect(dailyBalance(2000, 2000)).toBe(0)
  })

  it('projects weekly weight loss from actual intake vs maintenance', () => {
    // 500 kcal/day deficit vs 2000 maintenance, hit every day → -500*7/7000 = -0.5 kg
    const anchor = new Date(2026, 8, 7)
    const rows = buildWeekRows(() => 1500, 1500, anchor, '2026-09-14')
    expect(projectedWeightChange(rows, 2000)).toBe(-0.5)
  })

  it('projects no weight change when eating at maintenance', () => {
    const anchor = new Date(2026, 8, 7)
    const rows = buildWeekRows(() => 2000, 1500, anchor, '2026-09-14')
    expect(projectedWeightChange(rows, 2000)).toBe(0)
  })

  it('excludes future days from weight projection', () => {
    const anchor = new Date(2026, 8, 7)
    const totals = { '2026-09-07': 1500 }
    const rows = buildWeekRows((key) => totals[key] ?? 0, 1500, anchor, '2026-09-08')
    expect(projectedWeightChange(rows, 2000)).toBeCloseTo(-500 / 7000)
  })

  it('builds 7 week rows keyed by date', () => {
    const anchor = new Date(2026, 8, 7)
    const rows = buildWeekRows(() => 0, 2000, anchor)
    expect(rows).toHaveLength(7)
    expect(rows[0].key).toBe('2026-09-07')
    expect(rows[0].balance).toBe(-2000)
    expect(rows[6].key).toBe('2026-09-13')
  })

  it('builds week rows using a per-day total getter', () => {
    const anchor = new Date(2026, 8, 7)
    const totals = { '2026-09-07': 1800, '2026-09-08': 2200 }
    const rows = buildWeekRows((key) => totals[key] ?? 0, 2000, anchor)
    expect(rows[0].consumed).toBe(1800)
    expect(rows[0].balance).toBe(-200)
    expect(rows[1].consumed).toBe(2200)
    expect(rows[1].balance).toBe(200)
  })

  it('excludes future days from the realized weekly balance', () => {
    // Monday Sep 7 2026, "today" is Tuesday -> Wed..Sun are future.
    const anchor = new Date(2026, 8, 7)
    const totals = { '2026-09-07': 660 }
    const rows = buildWeekRows((key) => totals[key] ?? 0, 2000, anchor, '2026-09-08')

    // Only Monday counts: 660 - 2000 = -1340 (not -13340).
    expect(realizedBalance(rows)).toBe(-1340)
    expect(rows[0].isFuture).toBe(false)
    expect(rows[0].isToday).toBe(false)
    expect(rows[1].isToday).toBe(true)
    expect(rows[2].isFuture).toBe(true)
    expect(rows[6].isFuture).toBe(true)
  })

  it('excludes the in-progress day (today) from the realized weekly balance', () => {
    // Monday Sep 7 2026, "today" is Tuesday -> Monday is the only completed day.
    const anchor = new Date(2026, 8, 7)
    const totals = { '2026-09-07': 660, '2026-09-08': 0 }
    const rows = buildWeekRows((key) => totals[key] ?? 0, 2000, anchor, '2026-09-08')

    // Tuesday (today) shows a -2000 deficit but is not counted.
    expect(rows[1].isToday).toBe(true)
    expect(realizedBalance(rows)).toBe(-1340)
  })
})
