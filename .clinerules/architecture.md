# Architecture

Unidirectional data flow:
```
components → Pinia stores → storageService → localStorage (guest) | Supabase (signed-in)
```

## Layers
- **`src/services/storageService.js`** — the ONLY persistence seam. Components/stores never touch `localStorage` or Supabase directly. Getters/setters are synchronous over an in-memory doc cache; only `init()` (load) and `flush()` (force save) are async. Guest → localStorage; signed-in → Supabase (one JSON doc per user). Cloud writes debounced 400 ms; `flush()` on logout / tab-hide / auth change.
- **`src/stores/`** — Pinia state; each has an `init()` called from `App.vue` after `storageService.init()`:
  - `appStore` — locale + theme prefs.
  - `settingsStore` — maintenance calories, goal type, goal amount, current weight; exposes computed `dailyTarget`.
  - `diaryStore` — days keyed by date; entries (`item`/`group`); `totalForDay()`.
  - `foodsStore` — saved foods/groups library; `upsert` (by id or name+type), `recent()`, `all()`, `toggleFavorite()`, `sorted()` (favorites sort first).
  - `authStore` — Supabase auth: `signUp/signIn/signOut/resetPassword/updatePassword`, `onAuthStateChange`.
- **`src/utils/`** — pure, unit-tested logic: `date`, `analysis`, `format`, `id`, `units`, `nutrition`, `authErrors`.
- **`src/composables/`** — `useTheme` (resolve/apply theme), `useServingCalc` (shared serving math).
- **`src/components/`** — `ui/`, `layout/`, `diary/`; **`src/views/`** — route pages.

## Rules of thumb
- Never bypass `storageService` for persistence.
- Keep `src/utils/*` pure (no DOM/store access); unit-test them.
- New shared state goes in a Pinia store, not ad-hoc module state.
