// storageService — the single persistence seam.
//
// All data flows through this module. Components and stores never touch
// `localStorage` directly. To migrate to a real database later, replace the
// internals of these methods (making them async if needed) while keeping the
// same interface.

const STORAGE_KEY = 'calgoal'

const DEFAULT_SETTINGS = { calorieGoal: 2000, currentWeight: 70 }

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
    version: 1,
    days: {},
    settings: { ...DEFAULT_SETTINGS },
    prefs: { locale: defaultLocale(), theme: systemTheme() },
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
    data = {
      version: 1,
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      prefs: {
        locale: defaultLocale(),
        theme: systemTheme(),
        ...(parsed.prefs || {}),
      },
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

  resetAll() {
    saveData(createDefaultData())
  },
}
