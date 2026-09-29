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

function sanitizeDay(key, day) {
  const entries = Array.isArray(day?.entries)
    ? day.entries.map(sanitizeEntry).filter((e) => e.name)
    : []
  return { date: key, entries }
}

// Builds an export document from a days map (`{ dateKey: { date, entries } }`),
// optionally restricted to an inclusive date range. Date keys are strings, so a
// plain string comparison orders them chronologically.
export function buildExportDoc(days, { fromKey = null, toKey = null } = {}) {
  const out = {}
  const keys = Object.keys(days || {})
    .filter((k) => DATE_KEY_RE.test(k))
    .sort()

  for (const key of keys) {
    if (fromKey && key < fromKey) continue
    if (toKey && key > toKey) continue
    out[key] = sanitizeDay(key, days[key])
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    days: out,
  }
}

// Parses pasted JSON into a normalized days map. Accepts either the full export
// document (`{ version, exportedAt, days }`) or a bare days object. Throws an
// Error with a `.code` in {'empty', 'invalidJson', 'invalidFormat', 'noDays'}
// so callers can map it to a localized message.
export function parseImportText(text) {
  const raw = String(text ?? '').trim()
  if (!raw) {
    const err = new Error('empty')
    err.code = 'empty'
    throw err
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    const err = new Error('invalidJson')
    err.code = 'invalidJson'
    throw err
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    parsed.days &&
    typeof parsed.days === 'object' &&
    !Array.isArray(parsed.days)
  ) {
    parsed = parsed.days
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    const err = new Error('invalidFormat')
    err.code = 'invalidFormat'
    throw err
  }

  const days = {}
  for (const [key, day] of Object.entries(parsed)) {
    if (!DATE_KEY_RE.test(key)) continue
    const sd = sanitizeDay(key, day)
    if (sd.entries.length === 0) continue
    days[sd.date] = sd
  }

  if (Object.keys(days).length === 0) {
    const err = new Error('noDays')
    err.code = 'noDays'
    throw err
  }

  return days
}

// Merges incoming days over existing ones (incoming wins per date key).
export function mergeDays(existing, incoming) {
  return { ...existing, ...incoming }
}

// Total entry count across a days map.
export function countEntries(days) {
  let n = 0
  for (const day of Object.values(days || {})) {
    n += Array.isArray(day?.entries) ? day.entries.length : 0
  }
  return n
}
