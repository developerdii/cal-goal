import { describe, it, expect } from 'vitest'
import {
  buildExportDoc,
  parseImportText,
  mergeDays,
  countEntries,
  EXPORT_VERSION,
} from '@/utils/dataTransfer'

const sampleDays = {
  '2026-01-01': {
    date: '2026-01-01',
    entries: [
      { id: 'a', type: 'item', name: 'Banana', calories: 105, createdAt: 't1' },
    ],
  },
  '2026-01-02': {
    date: '2026-01-02',
    entries: [
      {
        id: 'b',
        type: 'group',
        name: 'Breakfast',
        items: [{ id: 'c', name: 'Oats', calories: 300 }],
        createdAt: 't2',
      },
    ],
  },
}

describe('buildExportDoc', () => {
  it('exports all days with a version and timestamp', () => {
    const doc = buildExportDoc(sampleDays)
    expect(doc.version).toBe(EXPORT_VERSION)
    expect(typeof doc.exportedAt).toBe('string')
    expect(Object.keys(doc.days)).toEqual(['2026-01-01', '2026-01-02'])
    expect(doc.days['2026-01-01'].entries).toHaveLength(1)
    expect(doc.days['2026-01-02'].entries[0].type).toBe('group')
  })

  it('filters to an inclusive date range', () => {
    const doc = buildExportDoc(sampleDays, { fromKey: '2026-01-02' })
    expect(Object.keys(doc.days)).toEqual(['2026-01-02'])

    const toOnly = buildExportDoc(sampleDays, { toKey: '2026-01-01' })
    expect(Object.keys(toOnly.days)).toEqual(['2026-01-01'])
  })

  it('sorts keys chronologically regardless of input order', () => {
    const days = {
      '2026-01-03': { date: '2026-01-03', entries: [] },
      '2026-01-01': { date: '2026-01-01', entries: [] },
    }
    expect(Object.keys(buildExportDoc(days).days)).toEqual(['2026-01-01', '2026-01-03'])
  })
})

describe('parseImportText', () => {
  it('accepts a full export document', () => {
    const doc = buildExportDoc(sampleDays)
    const days = parseImportText(JSON.stringify(doc))
    expect(Object.keys(days)).toEqual(['2026-01-01', '2026-01-02'])
    expect(days['2026-01-01'].entries[0].name).toBe('Banana')
  })

  it('accepts a bare days object', () => {
    const days = parseImportText(JSON.stringify(sampleDays))
    expect(Object.keys(days)).toEqual(['2026-01-01', '2026-01-02'])
  })

  it('fills in ids, types, timestamps and numeric calories', () => {
    const days = parseImportText(
      JSON.stringify({
        '2026-01-01': {
          date: '2026-01-01',
          entries: [{ name: 'Apple', calories: '95' }],
        },
      }),
    )
    const entry = days['2026-01-01'].entries[0]
    expect(typeof entry.id).toBe('string')
    expect(entry.type).toBe('item')
    expect(typeof entry.createdAt).toBe('string')
    expect(entry.calories).toBe(95)
  })

  it('resolves measured calories when omitted', () => {
    const days = parseImportText(
      JSON.stringify({
        '2026-01-01': {
          date: '2026-01-01',
          entries: [{ name: 'Chicken', unit: 'g', amount: 100, perKcal: 110, quantity: 250 }],
        },
      }),
    )
    expect(days['2026-01-01'].entries[0].calories).toBe(275)
  })

  it('throws a coded error for empty input', () => {
    try {
      parseImportText('   ')
    } catch (e) {
      expect(e.code).toBe('empty')
    }
  })

  it('throws a coded error for invalid JSON', () => {
    try {
      parseImportText('{ not json')
    } catch (e) {
      expect(e.code).toBe('invalidJson')
    }
  })

  it('throws a coded error for a non-object document', () => {
    try {
      parseImportText('42')
    } catch (e) {
      expect(e.code).toBe('invalidFormat')
    }
  })

  it('throws a coded error when no valid days are present', () => {
    try {
      parseImportText(JSON.stringify({ nope: { entries: [{ name: 'x', calories: 1 }] } }))
    } catch (e) {
      expect(e.code).toBe('noDays')
    }
  })
})

describe('mergeDays', () => {
  it('lets incoming days override existing ones', () => {
    const existing = { '2026-01-01': { date: '2026-01-01', entries: [] } }
    const incoming = { '2026-01-02': { date: '2026-01-02', entries: [] } }
    const merged = mergeDays(existing, incoming)
    expect(Object.keys(merged)).toEqual(['2026-01-01', '2026-01-02'])

    const override = mergeDays(
      { '2026-01-01': { date: '2026-01-01', entries: [] } },
      { '2026-01-01': { date: '2026-01-01', entries: [{ name: 'x', calories: 1 }] } },
    )
    expect(override['2026-01-01'].entries).toHaveLength(1)
  })
})

describe('countEntries', () => {
  it('sums entries across days, ignoring invalid days', () => {
    const days = {
      '2026-01-01': { date: '2026-01-01', entries: [{}, {}] },
      '2026-01-02': { date: '2026-01-02', entries: [] },
    }
    expect(countEntries(days)).toBe(2)
    expect(countEntries({})).toBe(0)
    expect(countEntries(null)).toBe(0)
  })
})
