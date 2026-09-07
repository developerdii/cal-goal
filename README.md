# CalGoal

A web app for tracking daily calorie intake. MVP focused on manual entry, built so it can
grow into API-based automatic calorie calculation and a real database backend.

## Features

- **Daily tracking** — add, edit, and delete entries per day (single foods or grouped meals)
- **Weekly navigation** — move between days and weeks (Mon–Sun)
- **Over/under indicator** — see how far each day is from the goal
- **Weekly analysis** — total surplus/deficit + estimated weight change (7,000 kcal ≈ 1 kg); future days are disabled and excluded from the balance
- **History** — previous weeks are preserved and remain viewable
- **Settings** — daily calorie goal, current weight, and a reset-all-data action
- **i18n** — Turkish & English, switchable from the UI
- **Theming** — dark / light (system-aware default, no flash)
- **Responsive** — mobile-first layout

## Tech

Vue 3 · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS · localStorage · Vitest

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview the production build
npm test          # run unit tests
```

## Architecture

```
components ──▶ stores (Pinia) ──▶ storageService ──▶ localStorage
```

- **`src/services/storageService.js`** is the *only* module that touches `localStorage`.
  To migrate to a real database, replace its internals (making methods async if needed)
  behind the same interface — no component or store changes required.
- **`src/stores`** hold app state (prefs, settings, diary) and orchestrate persistence.
- **`src/utils`** contain pure, unit-tested domain logic (dates, weekly analysis, formatting).

## Data model

A single versioned `localStorage` key `calgoal`:

```jsonc
{
  "version": 1,
  "days": {
    "2026-09-07": {
      "date": "2026-09-07",
      "entries": [
        { "id": "uuid", "type": "item", "name": "Banana", "calories": 105, "createdAt": "ISO-8601" },
        { "id": "uuid", "type": "group", "name": "Breakfast", "items": [{ "id": "uuid", "name": "Oats", "calories": 300 }], "createdAt": "ISO-8601" }
      ]
    }
  },
  "settings": { "calorieGoal": 2000, "currentWeight": 70 },
  "prefs": { "locale": "en", "theme": "light" }
}
```

Weeks start on Monday and are derived from date keys — no separate week records are needed,
and history is implicitly preserved by keeping days keyed by date.
