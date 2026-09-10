// storageService — the single persistence seam.
//
// All data flows through this module. Components and stores never touch
// `localStorage` directly. To migrate to a real database later, replace the
// internals of these methods (making them async if needed) while keeping the
// same interface.

const STORAGE_KEY = 'calgoal'

const DEFAULT_SETTINGS = {
  maintenanceCalories: 2000,
  goalType: 'maintain', // 'maintain' | 'deficit' | 'surplus'
  goalAmount: 0, // kcal/day for deficit/surplus
  currentWeight: 70,
}

function systemTheme() {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

function defaultLocale() {
  if (
    typeof navigator !== 'undefined' &&
    navigator.language &&
    navigator.language.toLowerCase().startsWith('tr')
  ) {
    return 'tr'
  }
  return 'en'
}

function createDefaultData() {
  return {
    version: 3,
    days: {},
    settings: { ...DEFAULT_SETTINGS },
    prefs: { locale: defaultLocale(), theme: systemTheme() },
    foods: [],
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function loadData() {
  if (typeof localStorage === 'undefined') return createDefaultData()

  let data
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultData()

    const parsed = JSON.parse(raw)

    // Settings with migration from the old single `calorieGoal` field.
    const rawSettings = parsed.settings || {}
    const settings = { ...DEFAULT_SETTINGS, ...rawSettings }
    if (rawSettings.maintenanceCalories == null && rawSettings.calorieGoal != null) {
      settings.maintenanceCalories = rawSettings.calorieGoal
      settings.goalType = 'maintain'
      settings.goalAmount = 0
    }

    data = {
      version: 3,
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
      settings,
      prefs: {
        locale: defaultLocale(),
        theme: systemTheme(),
        ...(parsed.prefs || {}),
      },
      foods: Array.isArray(parsed.foods) ? parsed.foods : [],
    }
  } catch {
    data = createDefaultData()
  }
  return data
}

function saveData(data) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const storageService = {
  // ---- Days ----
  getAllDays() {
    return clone(loadData().days)
  },
  getDay(dateKey) {
    const day = loadData().days[dateKey]
    return day ? clone(day) : null
  },
  saveDay(day) {
    const data = loadData()
    data.days[day.date] = clone(day)
    saveData(data)
  },
  removeDay(dateKey) {
    const data = loadData()
    delete data.days[dateKey]
    saveData(data)
  },
  clearDays() {
    const data = loadData()
    data.days = {}
    saveData(data)
  },

  // ---- Settings ----
  getSettings() {
    return clone(loadData().settings)
  },
  saveSettings(settings) {
    const data = loadData()
    data.settings = { ...data.settings, ...settings }
    saveData(data)
  },

  // ---- Preferences (locale / theme) ----
  getPrefs() {
    return clone(loadData().prefs)
  },
  savePrefs(prefs) {
    const data = loadData()
    data.prefs = { ...data.prefs, ...prefs }
    saveData(data)
  },

  // ---- UI state (per-instance toggles, e.g. picker open/closed) ----
  getPref(name) {
    return loadData().prefs?.[name]
  },
  setPref(name, value) {
    const data = loadData()
    data.prefs = { ...data.prefs, [name]: value }
    saveData(data)
  },

  // ---- Foods (favorites library) ----
  getFoods() {
    return clone(loadData().foods)
  },
  saveFood(food) {
    const data = loadData()
    const foods = Array.isArray(data.foods) ? data.foods : []
    const idx = foods.findIndex((f) => f.id === food.id)
    if (idx >= 0) foods[idx] = clone(food)
    else foods.push(clone(food))
    data.foods = foods
    saveData(data)
  },
  removeFood(id) {
    const data = loadData()
    data.foods = (Array.isArray(data.foods) ? data.foods : []).filter((f) => f.id !== id)
    saveData(data)
  },

  resetAll() {
    saveData(createDefaultData())
  },
}
