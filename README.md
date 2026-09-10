# CalGoal

**🌐 Live app:** [https://developerdii.github.io/cal-goal/](https://developerdii.github.io/cal-goal/)

A web app for tracking daily calorie intake. MVP focused on manual entry, built so it can
grow into API-based automatic calorie calculation and a real database backend.

## Features

- **Daily tracking** — add, edit, and delete entries per day (single foods or grouped meals)
- **Foods library** — save foods/groups as favorites and quick-add them later
- **Per-unit calories** — log by amount (e.g. "100 g = 110 kcal") and enter a quantity to auto-calculate
- **Weekly navigation** — move between days and weeks (Mon–Sun)
- **Over/under indicator** — see how far each day is from the goal
- **Weekly analysis** — total surplus/deficit + estimated weight change (7,000 kcal ≈ 1 kg); future days are disabled and excluded from the balance
- **History** — previous weeks are preserved and remain viewable
- **Settings** — daily calorie goal, current weight, and a reset-all-data action
- **i18n** — Turkish & English, switchable from the UI
- **Theming** — dark / light (system-aware default, no flash)
- **Responsive** — mobile-first layout

## Tech

Vue 3 · Vite · Pinia · Vue Router · vue-i18n · Tailwind CSS · localStorage · Supabase · Vitest

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview the production build
npm test          # run unit tests
```

## Git workflow

- All development happens on **`develop`**. **Never push directly to `main`.**
- `develop` → `main` is merged **only when the maintainer approves**.
- `main` is the production branch — pushing to it triggers the GitHub Pages deploy.

```bash
git checkout develop
# ... make changes ...
git add -A && git commit -m "type: description"
git push origin develop
```

When a batch of work is ready to ship, the maintainer merges `develop` into `main`.

## Deploy

Hosted on GitHub Pages; deploys are handled by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

- **Auto:** pushing to `main` triggers a build + deploy.
- **Manual:** the workflow can also be run from the repo's **Actions** tab.

Live URL: https://developerdii.github.io/cal-goal/

## Supabase (optional cloud sync)

The app works offline-first with `localStorage` for guests. Optionally sign in with
Supabase to sync your data across devices:

1. Create a Supabase project, then run the SQL in
   [`supabase/schema.sql`](supabase/schema.sql) (Supabase Dashboard → SQL editor).
   This creates the `user_data` table with Row Level Security.
2. Copy your **Project URL** and **anon key** (Dashboard → Project Settings → API)
   into `.env.local`:

   ```bash
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

3. (Optional) To let users sign in immediately after sign-up, disable
   "Confirm email" under Supabase → Authentication → Providers → Email.
4. Restart the dev server — a "Sign in" button appears in the header.

When signed in, all data (days, settings, foods, preferences) is stored as a single
JSON document per user in Supabase. The first sign-in migrates any existing local
data to the cloud; signing out returns to local storage.

> For the GitHub Pages deploy, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
> as repository secrets (they are injected at build time by the workflow).

## Architecture

```
components ──▶ stores (Pinia) ──▶ storageService ──▶ localStorage
```

- **`src/services/storageService.js`** is the *only* persistence boundary. Guests write
  to `localStorage`; signed-in users write to Supabase. It keeps a stable, mostly
  synchronous interface — only `init()` (load) and `flush()` (force save) are async.
- **`src/stores`** hold app state (prefs, settings, diary) and orchestrate persistence.
- **`src/utils`** contain pure, unit-tested domain logic (dates, weekly analysis, formatting).

## Data model

A single versioned `localStorage` key `calgoal`:

```jsonc
{
  "version": 3,
  "days": {
    "2026-09-07": {
      "date": "2026-09-07",
      "entries": [
        { "id": "uuid", "type": "item", "name": "Banana", "calories": 105, "createdAt": "ISO-8601" },
        { "id": "uuid", "type": "item", "name": "Chicken", "calories": 275, "unit": "g", "amount": 100, "perKcal": 110, "quantity": 250 },
        { "id": "uuid", "type": "group", "name": "Breakfast", "items": [{ "id": "uuid", "name": "Oats", "calories": 300 }] }
      ]
    }
  },
  "settings": { "maintenanceCalories": 2000, "goalType": "maintain", "goalAmount": 0, "currentWeight": 70 },
  "prefs": { "locale": "en", "theme": "light" },
  "foods": [
    { "id": "uuid", "type": "food", "name": "Chicken", "unit": "g", "amount": 100, "perKcal": 110 },
    { "id": "uuid", "type": "food", "name": "Banana", "calories": 105 }
  ]
}
```

Weeks start on Monday and are derived from date keys — no separate week records are needed,
and history is implicitly preserved by keeping days keyed by date.
