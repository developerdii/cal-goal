import { defaultServingAmount } from './units'

// Effective amount eaten: the typed quantity, or the reference amount (itself
// defaulting per unit) when left blank. Returns a string for display/pluralization.
export function resolveQuantity(amount, quantity, unit) {
  const q = String(quantity ?? '').trim()
  if (q !== '') return q
  const ref = String(amount ?? '').trim()
  return ref || String(defaultServingAmount(unit))
}

// Resolves total calories for a measured food given a reference amount
// ("amount" units = "perKcal" kcal) and a consumed quantity in the same unit.
// Rounds to whole kcal.
export function resolveKcal(amount, perKcal, quantity) {
  const a = Number(amount)
  if (!a || a <= 0) return 0
  return Math.round((Number(quantity) / a) * Number(perKcal))
}

// Resolves the total kcal for a saved food/group item of either shape:
// measured (unit/amount/perKcal, with quantity defaulting to the reference
// amount) or direct (`calories`). Used for library summaries and saved-group
// metadata so measured items show their real eaten calories, not 0.
export function resolveItemKcal(item) {
  if (item && item.unit) {
    return resolveKcal(
      item.amount,
      item.perKcal,
      resolveQuantity(item.amount, item.quantity, item.unit),
    )
  }
  return Number(item?.calories) || 0
}

