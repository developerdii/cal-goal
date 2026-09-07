import { describe, it, expect } from 'vitest'
import { dailyBalance, weeklySummary, buildWeekRows, realizedBalance } from '@/utils/analysis'

describe('analysis utils', () => {
  it('computes daily balance as consumed - goal', () => {
    expect(dailyBalance(1700, 2000)).toBe(-300)
    expect(dailyBalance(2150, 2000)).toBe(150)
    expect(dailyBalance(2000, 2000)).toBe(0)
  })

  it('sums the weekly balance across 7 days', () => {
    const days = [
      { consumed: 1700 },
      { consumed: 1700 },
      { consumed: 1700 },
      { consumed: 1700 },
      { consumed: 1700 },
      { consumed: 1700 },
      { consumed: 1700 },
    ]
    // 7 * (1700 - 2000) = 7 * -300 = -2100
    expect(weeklySummary(days, 2000).totalBalance).toBe(-2100)
  })

  it('estimates weight change using 7000 kcal = 1 kg', () => {
    expect(weeklySummary([{ consumed: 1300 }], 2000).estimatedWeightChange).toBe(-0.1)
    expect(weeklySummary([{ consumed: 9000 }], 2000).estimatedWeightChange).toBe(1)
    expect(weeklySummary([{ consumed: 2000 }], 2000).estimatedWeightChange).toBe(0)
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
    // Monday Sep 7 2026, "today" is that Monday -> Tue..Sun are future.
    const anchor = new Date(2026, 8, 7)
    const totals = { '2026-09-07': 660 }
    const rows = buildWeekRows((key) => totals[key] ?? 0, 2000, anchor, '2026-09-07')

    // Only Monday counts: 660 - 2000 = -1340 (not -13340).
    expect(realizedBalance(rows)).toBe(-1340)
    expect(rows[0].isFuture).toBe(false)
    expect(rows[1].isFuture).toBe(true)
    expect(rows[6].isFuture).toBe(true)
  })
})
