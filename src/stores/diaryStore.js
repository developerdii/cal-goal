import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '@/services/storageService'
import { createId } from '@/utils/id'

// An entry is either:
//   - item:  { id, type: 'item',  name, calories, createdAt }
//   - group: { id, type: 'group', name, items: [{ id, name, calories }], createdAt }
// Entries without a `type` (from older data) are treated as items.
function entryCalories(entry) {
  if (entry.type === 'group') {
    return (entry.items || []).reduce((s, it) => s + (Number(it.calories) || 0), 0)
  }
  return Number(entry.calories) || 0
}

export const useDiaryStore = defineStore('diary', () => {
  // { [dateKey]: { date, entries: [...] } }
  const days = ref({})

  function init() {
    days.value = storageService.getAllDays()
  }

  function getEntries(dateKey) {
    return days.value[dateKey]?.entries ?? []
  }

  function getDay(dateKey) {
    return days.value[dateKey] ?? null
  }

  function totalForDay(dateKey) {
    return getEntries(dateKey).reduce((sum, e) => sum + entryCalories(e), 0)
  }

  function persistDay(dateKey, entries) {
    const day = { date: dateKey, entries }
    days.value[dateKey] = day
    storageService.saveDay(day)
  }

  function addEntry(dateKey, payload) {
    const entry = {
      id: createId(),
      type: 'item',
      name: payload.name,
      calories: Number(payload.calories),
      quantity: payload.quantity ?? null,
      unit: payload.unit ?? null,
      amount: payload.amount ?? null,
      perKcal: payload.perKcal ?? null,
      foodId: payload.foodId ?? null,
      createdAt: new Date().toISOString(),
    }
    persistDay(dateKey, [...getEntries(dateKey), entry])
  }

  function addGroup(dateKey, payload) {
    const entry = {
      id: createId(),
      type: 'group',
      name: payload.name,
      items: (payload.items || []).map((it) => ({
        id: it.id || createId(),
        name: it.name,
        calories: Number(it.calories),
        quantity: it.quantity ?? null,
        unit: it.unit ?? null,
        amount: it.amount ?? null,
        perKcal: it.perKcal ?? null,
      })),
      foodId: payload.foodId ?? null,
      createdAt: new Date().toISOString(),
    }
    persistDay(dateKey, [...getEntries(dateKey), entry])
  }

  function updateEntry(dateKey, entryId, patch) {
    persistDay(
      dateKey,
      getEntries(dateKey).map((e) => (e.id === entryId ? { ...e, ...patch } : e)),
    )
  }

  function removeEntry(dateKey, entryId) {
    persistDay(dateKey, getEntries(dateKey).filter((e) => e.id !== entryId))
  }

  function reset() {
    days.value = {}
    storageService.clearDays()
  }

  return {
    days,
    init,
    getEntries,
    getDay,
    totalForDay,
    addEntry,
    addGroup,
    updateEntry,
    removeEntry,
    reset,
  }
})
