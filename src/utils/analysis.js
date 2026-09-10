import { getWeekDays, toDateKey, isFutureDay } from './date'

// consumed - target. Negative = under target (deficit), positive = over (surplus).
export function dailyBalance(consumed, target) {
  return consumed - target
}

// Builds the 7 rows for a week. `getTotal(dateKey)` returns consumed calories.
// `target` is the calculated daily target. Days are flagged as `isFuture`
// (strictly after today) or `isToday` (the day still in progress); both are
// excluded from `realizedBalance` / `projectedWeightChange`.
export function buildWeekRows(getTotal, target, anchor, todayKey = toDateKey(new Date())) {
  return getWeekDays(anchor).map((date) => {
    const key = toDateKey(date)
    const consumed = getTotal(key)
    return {
      key,
      date,
      consumed,
      balance: consumed - target,
      isFuture: isFutureDay(date, todayKey),
      isToday: key === todayKey,
    }
  })
}

// Weekly balance vs. the daily target, counting only completed days
// (everything strictly before today; the in-progress day is excluded).
export function realizedBalance(rows) {
  return rows
    .filter((r) => !r.isFuture && !r.isToday)
    .reduce((sum, r) => sum + r.balance, 0)
}

// Projected weekly weight change from actual intake vs. maintenance calories
// (7,000 kcal ≈ 1 kg), counting only completed days. Negative = loss.
export function projectedWeightChange(rows, maintenance) {
  const delta = rows
    .filter((r) => !r.isFuture && !r.isToday)
    .reduce((sum, r) => sum + (r.consumed - maintenance), 0)
  return delta / 7000
}

