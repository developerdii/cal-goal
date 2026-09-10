// Unit codes are stored language-agnostic; their display labels live in i18n
// under the `units.*` keys. Adding a new unit = add a code here + i18n keys.
export const UNIT_CODES = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'serving', 'bowl', 'slice', 'spoon', 'glass']

// Units offered in the "Add entry" reference amount picker.
export const REFERENCE_UNITS = ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving']

// Default unit selected in the form when switching to "amount" mode.
export const DEFAULT_UNIT = 'g'

// Sensible default serving amount for a unit: bulk units (g, ml) start at 100,
// discrete units (piece, serving, slice, …) start at 1. The amount stays editable.
export function defaultServingAmount(unit) {
  return unit === 'g' || unit === 'ml' ? 100 : 1
}

// Resolve the i18n key for a unit label, choosing the plural form unless the
// value is exactly 1. Count nouns pluralize in English ("2 pieces"), while
// bulk units (g, ml) and Turkish count nouns share the same label either way
// via their locale entries.
export function unitLabelKey(unit, value) {
  return Number(value) === 1 ? `units.${unit}` : `unitsPlural.${unit}`
}

