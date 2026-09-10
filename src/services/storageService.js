// storageService — the single persistence seam.
//
// All data flows through this module. Components and stores never touch
// `localStorage` or Supabase directly.
//
//   - Guest (not signed in)  → persisted to localStorage (unchanged behavior).
//   - Signed-in user         → persisted to Supabase (one JSON doc per user),
//                              so the data syncs across devices.
//
// The public getters/setters stay synchronous: they read from and write to an
// in-memory copy of the document. Only `init()` (load) and `flush()` (force
// save) are async.

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const STORAGE_KEY = 'calgoal'
const CLOUD_TABLE = 'user_data'
const SAVE_DEBOUNCE_MS = 400

const DEFAULT_SETTINGS = {
  maintenanceCalories: 2000,
  goalType: 'maintain', // 'maintain' | 'deficit' | 'surplus'
  goalAmount: 0, // kcal/day for deficit/surplus
  currentWeight: 70,
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
    prefs: { locale: defaultLocale(), theme: 'auto' },
    foods: [],
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

// Normalizes a parsed document: applies defaults and migrates old fields.
function normalize(parsed) {
  const rawSettings = parsed.settings || {}
  const settings = { ...DEFAULT_SETTINGS, ...rawSettings }
  if (rawSettings.maintenanceCalories == null && rawSettings.calorieGoal != null) {
    settings.maintenanceCalories = rawSettings.calorieGoal
    settings.goalType = 'maintain'
    settings.goalAmount = 0
  }

  return {
    version: 3,
    days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
    settings,
    prefs: {
      locale: defaultLocale(),
      theme: 'auto',
      ...(parsed.prefs || {}),
    },
    foods: Array.isArray(parsed.foods) ? parsed.foods : [],
  }
}

// ---- in-memory document cache ----
let state = null // full data doc (lazily initialized from localStorage)
let mode = 'local' // 'local' | 'cloud'
let userId = null // Supabase user id when mode === 'cloud'
let saveTimer = null

// ---- local backend ----
function loadLocal() {
  if (typeof localStorage === 'undefined') return createDefaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultData()
    return normalize(JSON.parse(raw))
  } catch {
    return createDefaultData()
  }
}

function saveLocal(data) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearLocal() {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ---- cloud backend ----
async function loadCloud(uid) {
  const { data, error } = await supabase
    .from(CLOUD_TABLE)
    .select('data')
    .eq('user_id', uid)
    .maybeSingle()
  if (error) throw error
  return data?.data ? normalize(data.data) : null
}

async function saveCloud(uid, data) {
  const { error } = await supabase
    .from(CLOUD_TABLE)
    .upsert(
      { user_id: uid, data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
  if (error) throw error
}

function ensureState() {
  if (!state) state = loadLocal()
  return state
}

function hasMeaningfulLocalData(data) {
  const s = data.settings || {}
  return (
    Object.keys(data.days || {}).length > 0 ||
    (Array.isArray(data.foods) && data.foods.length > 0) ||
    s.maintenanceCalories !== DEFAULT_SETTINGS.maintenanceCalories ||
    s.goalType !== DEFAULT_SETTINGS.goalType ||
    s.goalAmount !== DEFAULT_SETTINGS.goalAmount ||
    s.currentWeight !== DEFAULT_SETTINGS.currentWeight
  )
}

function scheduleSave() {
  if (mode !== 'cloud') {
    saveLocal(state)
    return
  }
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    flush()
  }, SAVE_DEBOUNCE_MS)
}

// Persists any pending writes immediately (logout / tab hide / auth change).
async function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (!state) return

  if (mode === 'cloud' && userId && supabase) {
    try {
      await saveCloud(userId, state)
    } catch (err) {
      console.error('storageService: cloud save failed', err)
    }
  } else {
    saveLocal(state)
  }
}

// Loads the document for the given user (or the guest doc when user is null).
// Throws if a signed-in user's cloud data can't be loaded or seeded, so the
// caller can react (e.g. sign the user out).
async function init(user) {
  await flush()

  if (user?.id && isSupabaseConfigured && supabase) {
    const remote = await loadCloud(user.id)
    if (remote) {
      state = remote
    } else if (hasMeaningfulLocalData(loadLocal())) {
      // First sign-in: migrate the guest data to the cloud ONCE, then clear
      // the local store so it isn't migrated again on later log-ins.
      state = loadLocal()
      await saveCloud(user.id, state)
      clearLocal()
    } else {
      state = createDefaultData()
      await saveCloud(user.id, state)
    }
    mode = 'cloud'
    userId = user.id
    return state
  }

  mode = 'local'
  userId = null
  state = loadLocal()
  return state
}

export const storageService = {
  init,
  flush,

  // ---- Days ----
  getAllDays() {
    return clone(ensureState().days)
  },
  getDay(dateKey) {
    const day = ensureState().days[dateKey]
    return day ? clone(day) : null
  },
  saveDay(day) {
    const data = ensureState()
    data.days[day.date] = clone(day)
    scheduleSave()
  },
  removeDay(dateKey) {
    const data = ensureState()
    delete data.days[dateKey]
    scheduleSave()
  },
  clearDays() {
    const data = ensureState()
    data.days = {}
    scheduleSave()
  },

  // ---- Settings ----
  getSettings() {
    return clone(ensureState().settings)
  },
  saveSettings(settings) {
    const data = ensureState()
    data.settings = { ...data.settings, ...settings }
    scheduleSave()
  },

  // ---- Preferences (locale / theme) ----
  getPrefs() {
    return clone(ensureState().prefs)
  },
  savePrefs(prefs) {
    const data = ensureState()
    data.prefs = { ...data.prefs, ...prefs }
    scheduleSave()
  },

  // ---- UI state (per-instance toggles, e.g. picker open/closed) ----
  getPref(name) {
    return ensureState().prefs?.[name]
  },
  setPref(name, value) {
    const data = ensureState()
    data.prefs = { ...data.prefs, [name]: value }
    scheduleSave()
  },

  // ---- Foods (favorites library) ----
  getFoods() {
    return clone(ensureState().foods)
  },
  saveFood(food) {
    const data = ensureState()
    const foods = Array.isArray(data.foods) ? data.foods : []
    const idx = foods.findIndex((f) => f.id === food.id)
    if (idx >= 0) foods[idx] = clone(food)
    else foods.push(clone(food))
    data.foods = foods
    scheduleSave()
  },
  removeFood(id) {
    const data = ensureState()
    data.foods = (Array.isArray(data.foods) ? data.foods : []).filter((f) => f.id !== id)
    scheduleSave()
  },

  resetAll() {
    state = createDefaultData()
    scheduleSave()
  },
}
