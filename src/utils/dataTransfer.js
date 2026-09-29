import { createId } from './id'
import { resolveItemKcal } from './nutrition'

// Version tag stamped into every export. Bump it when the export format changes.
export const EXPORT_VERSION = 1

// Local date keys ("YYYY-MM-DD") — matches the app's date-key convention.
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

// Copies the optional "measured serving" fields, which the diary stores on
// measured items so they can be re-edited / summarized.
function copyMeasuredFields(target, src) {
  if (src.unit != null) target.unit = String(src.unit)
  if (src.amount != null) target.amount = num(src.amount)
  if (src.perKcal != null) target.perKcal = num(src.perKcal)
  if (src.quantity != null) target.quantity = num(src.quantity)
  return target
}

function sanitizeGroupItem(item) {
  let calories = num(item?.calories)
  // Allow hand-crafted bulk imports to omit `calories` and provide the serving
  // math instead; resolve it the same way the diary does.
  if (calories <= 0 && item?.unit) calories = resolveItemKcal(item)

  const out = {
    id: item?.id || createId(),
    name: String(item?.name ?? '').trim(),
    calories,
  }
  return copyMeasuredFields(out, item)
}

function sanitizeEntry(entry) {
  const isGroup = entry?.type === 'group'
  const out = {
    id: entry?.id || createId(),
    type: isGroup ? 'group' : 'item',
    name: String(entry?.name ?? '').trim(),
    createdAt: entry?.createdAt || new Date().toISOString(),
  }

  if (isGroup) {
    out.items = Array.isArray(entry.items)
      ? entry.items.map(sanitizeGroupItem).filter((it) => it.name)
      : []
  } else {
    out.calories = num(entry?.calories)
    if (out.calories <= 0 && entry?.unit) out.calories = resolveItemKcal(entry)
    copyMeasuredFields(out, entry)
  }

  if (entry?.foodId != null) out.foodId = entry.foodId
  return out
}

// Builds a single-day export document from a day object (`{ date, entries }`).
export function buildDayExport(day) {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    date: typeof day?.date === 'string' ? day.date : '',
    entries: Array.isArray(day?.entries)
      ? day.entries.map(sanitizeEntry).filter((e) => e.name)
      : [],
  }
}

function codedError(code) {
  const err = new Error(code)
  err.code = code
  return err
}

// Parses pasted JSON into a normalized entries array. Accepts either the
// single-day export document (`{ version, exportedAt, date, entries }`) or a
// legacy full export (`{ days: { "YYYY-MM-DD": { entries } } }`, whose entries
// are flattened together). Throws an Error with a `.code` in
// {'empty', 'invalidJson', 'invalidFormat', 'noEntries'} so callers can map it
// to a localized message.
export function parseDayImport(text) {
  const raw = String(text ?? '').trim()
  if (!raw) throw codedError('empty')

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw codedError('invalidJson')
  }

  let entries = null
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (Array.isArray(parsed.entries)) {
      entries = parsed.entries
    } else if (parsed.days && typeof parsed.days === 'object' && !Array.isArray(parsed.days)) {
      entries = []
      for (const [key, day] of Object.entries(parsed.days)) {
        if (!DATE_KEY_RE.test(key)) continue
        if (Array.isArray(day?.entries)) entries.push(...day.entries)
      }
    }
  }

  if (!Array.isArray(entries)) throw codedError('invalidFormat')

  const cleaned = entries.map(sanitizeEntry).filter((e) => e.name)
  if (cleaned.length === 0) throw codedError('noEntries')

  return cleaned
}
