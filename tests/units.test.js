import { describe, it, expect } from 'vitest'
import { defaultServingAmount, unitLabelKey } from '@/utils/units'

describe('units utils', () => {
  it('defaults bulk units to 100 and discrete units to 1', () => {
    expect(defaultServingAmount('g')).toBe(100)
    expect(defaultServingAmount('ml')).toBe(100)
    expect(defaultServingAmount('serving')).toBe(1)
    expect(defaultServingAmount('piece')).toBe(1)
  })

  it('picks the singular label only for exactly 1', () => {
    expect(unitLabelKey('piece', 1)).toBe('units.piece')
    expect(unitLabelKey('piece', 2)).toBe('unitsPlural.piece')
    expect(unitLabelKey('serving', 1)).toBe('units.serving')
    expect(unitLabelKey('serving', 1.5)).toBe('unitsPlural.serving')
  })

  it('uses the plural key for bulk units too (labels stay invariant)', () => {
    expect(unitLabelKey('g', 1)).toBe('units.g')
    expect(unitLabelKey('g', 250)).toBe('unitsPlural.g')
  })
})
