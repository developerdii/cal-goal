import { describe, it, expect } from 'vitest'
import { resolveKcal } from '@/utils/nutrition'

describe('nutrition utils', () => {
  it('resolves calories from a reference amount', () => {
    expect(resolveKcal(100, 110, 100)).toBe(110)
    expect(resolveKcal(100, 110, 250)).toBe(275) // 250 / 100 * 110
    expect(resolveKcal(100, 80, 120)).toBe(96) // 120 / 100 * 80
  })

  it('rounds to whole kcal', () => {
    expect(resolveKcal(100, 110, 255)).toBe(281) // 280.5 -> 281
  })

  it('handles per-serving foods (amount = 1) with decimals', () => {
    expect(resolveKcal(1, 110, 5.5)).toBe(605)
  })

  it('guards against a non-positive reference amount', () => {
    expect(resolveKcal(0, 110, 100)).toBe(0)
    expect(resolveKcal(-5, 110, 100)).toBe(0)
  })
})

