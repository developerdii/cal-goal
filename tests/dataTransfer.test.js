import { describe, it, expect } from 'vitest'
import { buildDayExport, parseDayImport, EXPORT_VERSION } from '@/utils/dataTransfer'

const sampleDay = {
  date: '2026-01-01',
  entries: [
    { id: 'a', type: 'item', name: 'Banana', calories: 105, createdAt: 't1' },
    {
      id: 'b',
      type: 'group',
      name: 'Breakfast',
      items: [{ id: 'c', name: 'Oats', calories: 300 }],
      createdAt: 't2',
    },
  ],
}

describe('buildDayExport', () => {
  it('exports a single day with a version and timestamp', () => {
    const doc = buildDayExport(sampleDay)
    expect(doc.version).toBe(EXPORT_VERSION)
    expect(typeof doc.exportedAt).toBe('string')
    expect(doc.date).toBe('2026-01-01')
    expect(doc.entries).toHaveLength(2)
    expect(doc.entries[0].name).toBe('Banana')
    expect(doc.entries[1].type).toBe('group')
  })

  it('filters out nameless entries and handles a missing day', () => {
    const day = { date: '2026-01-01', entries: [{ calories: 100 }] }
    expect(buildDayExport(day).entries).toHaveLength(0)

    const empty = buildDayExport(null)
    expect(empty.date).toBe('')
    expect(empty.entries).toHaveLength(0)
  })
})

describe('parseDayImport', () => {
  it('accepts a single-day export document', () => {
    const doc = buildDayExport(sampleDay)
    const entries = parseDayImport(JSON.stringify(doc))
    expect(entries).toHaveLength(2)
    expect(entries[0].name).toBe('Banana')
  })

  it('accepts a bare entries array', () => {
    const entries = parseDayImport(
      JSON.stringify({ entries: [{ name: 'Apple', calories: 95 }] }),
    )
    expect(entries).toHaveLength(1)
    expect(entries[0].calories).toBe(95)
  })

  it('accepts a legacy days document and flattens its entries', () => {
    const entries = parseDayImport(
      JSON.stringify({
        days: {
          '2026-01-01': { date: '2026-01-01', entries: [{ name: 'One', calories: 1 }] },
          '2026-01-02': { date: '2026-01-02', entries: [{ name: 'Two', calories: 2 }] },
        },
      }),
    )
    expect(entries).toHaveLength(2)
    expect(entries.map((e) => e.name)).toEqual(['One', 'Two'])
  })

  it('fills in ids, types, timestamps and numeric calories', () => {
    const entries = parseDayImport(
      JSON.stringify({ entries: [{ name: 'Apple', calories: '95' }] }),
    )
    const entry = entries[0]
    expect(typeof entry.id).toBe('string')
    expect(entry.type).toBe('item')
    expect(typeof entry.createdAt).toBe('string')
    expect(entry.calories).toBe(95)
  })

  it('resolves measured calories when omitted', () => {
    const entries = parseDayImport(
      JSON.stringify({
        entries: [{ name: 'Chicken', unit: 'g', amount: 100, perKcal: 110, quantity: 250 }],
      }),
    )
    expect(entries[0].calories).toBe(275)
  })

  it('throws a coded error for empty input', () => {
    expect(() => parseDayImport('   ')).toThrow(/empty/)
  })

  it('throws a coded error for invalid JSON', () => {
    expect(() => parseDayImport('{ not json')).toThrow(/invalidJson/)
  })

  it('throws a coded error for a non-object document', () => {
    expect(() => parseDayImport('42')).toThrow(/invalidFormat/)
  })

  it('throws a coded error when no entries are present', () => {
    expect(() => parseDayImport(JSON.stringify({ entries: [] }))).toThrow(/noEntries/)
  })
})
