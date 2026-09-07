import { getWeekDays, toDateKey, isFutureDay } from './date'

// consumed - target. Negative = under target (deficit), positive = over (surplus).
export function dailyBalance(consumed, target) {
  return consumed - target
}

// Builds the 7 rows for a week. `getTotal(dateKey)` returns consumed calories.
// `target` is the calculated daily target. Future days are flagged (`isFuture`)
// and excluded from `realizedBalance` / `projectedWeightChange`.
export function buildWeekRows(getTotal, target, anchor, todayKey) {
  return getWeekDays(anchor).map((date) => {
    const key = toDateKey(date)
    const consumed = getTotal(key)
    return {
      key,
      date,
      consumed,
      balance: consumed - target,
      isFuture: isFutureDay(date, todayKey),
    }
  })
}

// Weekly balance vs. the daily target, counting only days up to today.
export function realizedBalance(rows) {
  return rows.filter((r) => !r.isFuture).reduce((sum, r) => sum + r.balance, 0)
}

// Projected weekly weight change from actual intake vs. maintenance calories
// (7,000 kcal ≈ 1 kg), counting only days up to today. Negative = loss.
export function projectedWeightChange(rows, maintenance) {
  const delta = rows
    .filter((r) => !r.isFuture)
    .reduce((sum, r) => sum + (r.consumed - maintenance), 0)
  return delta / 7000
}

