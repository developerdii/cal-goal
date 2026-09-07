import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storageService } from '@/services/storageService'

export const useSettingsStore = defineStore('settings', () => {
  const calorieGoal = ref(2000)
  const currentWeight = ref(70)

  function init() {
    const s = storageService.getSettings()
    calorieGoal.value = s.calorieGoal
    currentWeight.value = s.currentWeight
  }

  function setCalorieGoal(value) {
    const n = Number(value)
    calorieGoal.value = Number.isFinite(n) && n > 0 ? n : calorieGoal.value
    persist()
  }

  function setCurrentWeight(value) {
    const n = Number(value)
    currentWeight.value = Number.isFinite(n) && n >= 0 ? n : currentWeight.value
    persist()
  }

  function persist() {
    storageService.saveSettings({
      calorieGoal: calorieGoal.value,
      currentWeight: currentWeight.value,
    })
  }

  function reset() {
    calorieGoal.value = 2000
    currentWeight.value = 70
    persist()
  }

  return { calorieGoal, currentWeight, init, setCalorieGoal, setCurrentWeight, reset }
})
