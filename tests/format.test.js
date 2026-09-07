import { describe, it, expect } from 'vitest'
import {
  formatKcal,
  formatSignedKcal,
  formatSignedWeight,
  formatWeekLabel,
} from '@/utils/format'

describe('format utils', () => {
  it('formats kcal with locale grouping', () => {
    expect(formatKcal(1234, 'en')).toBe('1,234')
    expect(formatKcal(1234, 'tr')).toBe('1.234')
  })

  it('formats signed kcal', () => {
    expect(formatSignedKcal(150, 'en')).toBe('+150')
    expect(formatSignedKcal(-300, 'en')).toBe('\u2212300')
    expect(formatSignedKcal(0, 'en')).toBe('0')
  })

  it('formats signed weight with up to 2 decimals', () => {
    expect(formatSignedWeight(-0.12857, 'en')).toBe('\u22120.13')
    expect(formatSignedWeight(0.06, 'en')).toBe('+0.06')
  })

  it('formats a week label within the same month/year', () => {
    const start = new Date(2026, 8, 7)
    const end = new Date(2026, 8, 13)
    const label = formatWeekLabel(start, end, 'en')
    expect(label).toContain('Sep')
    expect(label).toContain('2026')
    expect(label).toContain('7')
    expect(label).toContain('13')
  })
})
