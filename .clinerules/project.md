# Project Overview

**CalGoal** — a mobile-first calorie-tracking web app (Vue 3 SPA). Logs daily intake against a goal, weekly analysis, a saved-foods library, optional Supabase cloud sync, TR/EN locales, and dark/light theming.

## Tech stack
Vue 3 (Composition API + `<script setup>`) · Vite · Pinia · Vue Router (hash history) · vue-i18n · Tailwind CSS v3 · Vitest · localStorage · Supabase (`@supabase/supabase-js`).

## Commands
```bash
npm run dev     # dev server
npm run build   # production build
npm test        # unit tests (vitest run)
```

## Key facts
- Router uses **hash history** (`createWebHashHistory`) so deep links work on static hosting (GitHub Pages).
- Routes: `/`, `/week`, `/settings`, `/foods`, `/login`, `/signup`, `/forgot-password`, `/reset-password`.
- Boot sequence in `src/App.vue`: `storageService.init(user)` → refresh every store → apply locale/theme.
- Live: https://developerdii.github.io/cal-goal/
