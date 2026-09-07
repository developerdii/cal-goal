import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storageService } from '@/services/storageService'

export const useSettingsStore = defineStore('settings', () => {
  const maintenanceCalories = ref(2000)
  const goalType = ref('maintain') // 'maintain' | 'deficit' | 'surplus'
  const goalAmount = ref(0) // kcal/day for deficit/surplus
  const currentWeight = ref(70)

  // Calculated daily target shown on the home screen.
  const dailyTarget = computed(() => {
    if (goalType.value === 'deficit') {
      return Math.max(0, maintenanceCalories.value - goalAmount.value)
    }
    if (goalType.value === 'surplus') {
      return maintenanceCalories.value + goalAmount.value
    }
    return maintenanceCalories.value
  })

  function init() {
    const s = storageService.getSettings()
    maintenanceCalories.value = s.maintenanceCalories ?? 2000
    goalType.value = s.goalType ?? 'maintain'
    goalAmount.value = s.goalAmount ?? 0
    currentWeight.value = s.currentWeight ?? 70
  }

  function setMaintenanceCalories(value) {
    const n = Number(value)
    if (Number.isFinite(n) && n > 0) maintenanceCalories.value = Math.round(n)
    persist()
  }

  function setGoalType(value) {
    if (['maintain', 'deficit', 'surplus'].includes(value)) goalType.value = value
    persist()
  }

  function setGoalAmount(value) {
    const n = Number(value)
    if (Number.isFinite(n) && n >= 0) goalAmount.value = Math.round(n)
    persist()
  }

  function setCurrentWeight(value) {
    const n = Number(value)
    if (Number.isFinite(n) && n >= 0) currentWeight.value = n
    persist()
  }

  function reset() {
    maintenanceCalories.value = 2000
    goalType.value = 'maintain'
    goalAmount.value = 0
    currentWeight.value = 70
    persist()
  }

  function persist() {
    storageService.saveSettings({
      maintenanceCalories: maintenanceCalories.value,
      goalType: goalType.value,
      goalAmount: goalAmount.value,
      currentWeight: currentWeight.value,
    })
  }

  return {
    maintenanceCalories,
    goalType,
    goalAmount,
    currentWeight,
    dailyTarget,
    init,
    setMaintenanceCalories,
    setGoalType,
    setGoalAmount,
    setCurrentWeight,
    reset,
  }
})
