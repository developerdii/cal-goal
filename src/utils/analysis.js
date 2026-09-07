import { getWeekDays, toDateKey, isFutureDay } from './date'

// consumed - goal. Negative = under goal (deficit), positive = over goal (surplus).
export function dailyBalance(consumed, goal) {
  return consumed - goal
}

// `days` = [{ consumed }, ...]. Returns total balance and estimated weight change.
export function weeklySummary(days, goal) {
  const totalBalance = days.reduce((sum, d) => sum + (d.consumed - goal), 0)
  const estimatedWeightChange = totalBalance / 7000
  return { totalBalance, estimatedWeightChange }
}

// Builds the 7 rows for a week. `getTotal(dateKey)` returns consumed calories.
// Future days are flagged (`isFuture`) so callers can disable them; they are
// excluded from `realizedBalance` because they haven't happened yet.
export function buildWeekRows(getTotal, goal, anchor, todayKey) {
  return getWeekDays(anchor).map((date) => {
    const key = toDateKey(date)
    const consumed = getTotal(key)
    return {
      key,
      date,
      consumed,
      balance: consumed - goal,
      isFuture: isFutureDay(date, todayKey),
    }
  })
}

// Weekly balance counting only days up to today.
export function realizedBalance(rows) {
  return rows.filter((r) => !r.isFuture).reduce((sum, r) => sum + r.balance, 0)
}
