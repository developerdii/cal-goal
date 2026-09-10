# Architecture

CalGoal — a calorie-tracking web app (Vue 3 SPA).

## Tech stack
Vue 3 (Composition API + `<script setup>`) · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS v3 · Vitest · localStorage · Supabase (optional cloud sync).

## Structure
- `src/services/storageService.js` — the **only** persistence boundary (localStorage for guests, Supabase for signed-in users). Never touch localStorage elsewhere.
- `src/stores/` — Pinia state: `appStore`, `settingsStore`, `diaryStore`, `foodsStore`, `authStore`.
- `src/utils/` — pure, unit-tested domain logic: `date`, `analysis`, `format`, `id`, `units`, `nutrition`.
- `src/components/` — reusable UI (`ui/`, `layout/`, `diary/`); `src/views/` — route pages.
- `tests/` — Vitest unit tests for the pure domain logic.

## Key conventions
- Weeks start on **Monday**, derived from local `YYYY-MM-DD` date keys (see `src/utils/date.js`).
- All date math is local-time safe — always use `src/utils/date.js` helpers, never raw `Date` arithmetic.
