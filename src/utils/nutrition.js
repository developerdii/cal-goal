// Resolves total calories for a measured food given a reference amount
// ("amount" units = "perKcal" kcal) and a consumed quantity in the same unit.
// Rounds to whole kcal.
export function resolveKcal(amount, perKcal, quantity) {
  const a = Number(amount)
  if (!a || a <= 0) return 0
  return Math.round((Number(quantity) / a) * Number(perKcal))
}

