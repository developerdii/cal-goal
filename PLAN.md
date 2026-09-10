# CalGoal — Project Plan

A web app for tracking daily calorie intake. Starts as an MVP (manual entry) but is
architected so it can later grow into API-based automatic calorie calculation and a
real database backend.

## Tech Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vite** (build/dev tooling)
- **Tailwind CSS v3** (utility-first, `darkMode: 'class'` for dark/light themes)
- **Pinia** (state management)
- **Vue Router** (routing)
- **vue-i18n** (Turkish + English, switchable from the UI)
- **localStorage** behind a `storageService` abstraction
- **Vitest** (unit tests for the pure domain logic)

## Milestones

### M1 — Project scaffolding ✅
- [x] Vite + Vue 3 project config (`package.json`, `vite.config.js`)
- [x] Tailwind + PostCSS setup, dark-mode class strategy
- [x] Router (Home, Week, Settings)
- [x] i18n setup (`src/i18n` with `en` / `tr` locales)
- [x] Global layout (header, bottom nav, page shell)

### M2 — Data layer (future DB-ready) ✅
- [x] `storageService` — the ONLY module that touches `localStorage`
- [x] Versioned schema with forward-compatible merge (settings/prefs defaults)
- [x] Domain utilities: `date`, `analysis`, `format`, `id`

### M3 — State stores ✅
- [x] `appStore` — locale + theme preferences
- [x] `settingsStore` — daily calorie goal + current weight
- [x] `diaryStore` — day entries (add/edit/remove), totals

### M4 — Daily calorie tracking (Home) ✅
- [x] Week strip navigation (Mon–Sun) + prev/next day arrows
- [x] List today's/selected day's entries (empty state)
- [x] Add / edit / delete entries (modal form + confirm delete)
- [x] Over/under goal indicator (e.g. `-300 kcal` / `+150 kcal`) with progress bar

### M5 — Weekly view & analysis ✅
- [x] Weekly navigation (prev/next week) — history is preserved, never deleted
- [x] Sum daily surplus/deficit into a weekly total
- [x] Estimate weekly weight change via **7000 kcal ≈ 1 kg** (using current weight)
- [x] Per-day balance list

### M6 — Settings ✅
- [x] Daily calorie goal input (default 2000)
- [x] Current weight input
- [x] Persisted via `settingsStore` → `storageService`

### M7 — i18n, theming, responsive, polish ✅
- [x] TR/EN switch in header (persisted)
- [x] Dark/light toggle (persisted, system-aware default, no FOUC)
- [x] Mobile-first responsive layout
- [x] Tests for date/analysis/format logic

### M8 — Rebranding & header layout ✅
- [x] Rename app "Calorie Counter" → "CalGoal" (header, `<title>`, i18n, package.json, docs)
- [x] Rename localStorage key `calorie-counter` → `calgoal`
- [x] Header: logo + name + tagline (left), TR/EN + theme toggle (right)
- [x] Responsive header (tagline hides on small screens, no overlap)
- [x] Create CHANGELOG.md and log the change

### M9 — Foods library & per-unit calories ✅
- [x] `foods` storage + `foodsStore` + `utils/{units,nutrition}.js` + nutrition tests
- [x] Food form: kcal/amount mode toggle + "save to foods"
- [x] Group form: per-row kcal/amount modes + "save to foods"
- [x] Quick-add saved foods from the add chooser
- [x] "Foods" screen (list + create/edit/delete) + nav tab + route
- [x] i18n (units, form, foods)

### M10 — "Add Group" modal redesign ✅
- [x] Live group calorie total in the items header
- [x] Compact single-line item rows (kcal mode) + clear expanded amount mode
- [x] Small icon mode toggle (scale/bolt) instead of full-width segmented buttons
- [x] Sticky modal footer (BaseModal footer slot + scrollable body)
- [x] "Save to foods" as a grouped card; subtler empty-item styling; tighter spacing

### M11 — Explicit deficit/surplus goal logic ✅
- [x] Settings: maintenance calories + goal type (maintain/deficit/surplus) + kcal/day amount
- [x] `settingsStore`: computed `dailyTarget` + migration from old single `calorieGoal`
- [x] Home / DaySummary use the calculated daily target
- [x] Weekly: balance vs daily target; weight projection vs maintenance (7000 kcal ≈ 1 kg)
- [x] i18n (TR/EN), tests, docs

### M12 — "Add entry" modal refinement ✅
- [x] Split serving/calories/amount-eaten into "This food" and "How much you ate" cards with an aligned grid
- [x] Right-aligned numeric inputs; "kcal" as the fixed second column
- [x] Segmented control relabeled "Enter total calories" / "Calculate from serving" (default serving)
- [x] Default unit `g`; fuller unit list (`g, ml, oz, cup, tbsp, tsp, piece, slice, serving`)
- [x] Amount eaten starts empty and falls back to the reference amount; unit change clears calories (no conversion)
- [x] Total sentence with empty-state hint; inline name validation + focus; custom "Save to my foods" checkbox

## Folder / File Structure

```
calgoal/
├── PLAN.md
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── style.css
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/{en,tr}.json
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   └── storageService.js       # single localStorage seam
│   ├── stores/
│   │   ├── appStore.js
│   │   ├── settingsStore.js
│   │   └── diaryStore.js
│   ├── utils/
│   │   ├── date.js
│   │   ├── analysis.js
│   │   ├── format.js
│   │   └── id.js
│   ├── composables/
│   │   └── useTheme.js
│   ├── components/
│   │   ├── layout/{AppHeader,AppBottomNav}.vue
│   │   ├── ui/{Icon,ThemeToggle,LocaleSwitch,BaseModal,ConfirmDialog}.vue
│   │   └── diary/{WeekStrip,DaySummary,EntryList,EntryItem,EntryFormModal}.vue
│   └── views/
│       ├── HomeView.vue
│       ├── WeekView.vue
│       └── SettingsView.vue
└── tests/
    ├── date.test.js
    ├── analysis.test.js
    └── format.test.js
```

## Data Model (localStorage schema)

Single versioned key `calgoal`:

```jsonc
{
  "version": 3,
  "days": {
    "2026-09-07": {                    // local date key YYYY-MM-DD
      "date": "2026-09-07",
      "entries": [
        { "id": "uuid", "type": "item", "name": "Banana", "calories": 105, "createdAt": "ISO-8601" },
        { "id": "uuid", "type": "item", "name": "Chicken", "calories": 275,
          "unit": "g", "amount": 100, "perKcal": 110, "quantity": 250, "createdAt": "ISO-8601" },
        { "id": "uuid", "type": "group", "name": "Breakfast",
          "items": [ { "id": "uuid", "name": "Oats", "calories": 300 } ], "createdAt": "ISO-8601" }
      ]
    }
  },
  "settings": {
    "maintenanceCalories": 2000,       // baseline; daily target is derived from goal type
    "goalType": "maintain",            // 'maintain' | 'deficit' | 'surplus'
    "goalAmount": 0,                   // kcal/day (deficit/surplus only)
    "currentWeight": 70                // kg
  },
  "prefs": {
    "locale": "en",                    // 'en' | 'tr'
    "theme": "light"                   // 'light' | 'dark'
  },
  "foods": [                           // favorites library
    { "id": "uuid", "type": "food", "name": "Chicken", "unit": "g", "amount": 100, "perKcal": 110 },
    { "id": "uuid", "type": "food", "name": "Banana", "calories": 105 },
    { "id": "uuid", "type": "group", "name": "Chicken dish", "items": [ { "name": "Rice", "calories": 200 } ] }
  ]
}
```

### Design decisions
- **Week starts Monday** (common in TR/EU), derived from the date key — no separate week record needed.
- **History is implicit**: days are keyed by date, so previous weeks persist and are
  reachable via week navigation. Nothing is deleted on week change.
- **Migration path**: swapping localStorage → real DB means replacing `storageService`
  internals (later async) behind the same interface; stores already treat it as the
  only persistence boundary.

## Weekly Analysis Math

- `dailyBalance = consumed − goal`  →  `-300` = under by 300, `+150` = over by 150
- `weeklyTotal = Σ(dailyBalance)` over the 7 days of the week
- `estimatedWeightChange(kg) = weeklyTotal / 7000`

## Task Checklist (summary)

- [x] Scaffold + config
- [x] storageService + schema
- [x] domain utils + tests
- [x] stores
- [x] i18n locales
- [x] layout + theme/locale toggles
- [x] Home (daily log + week navigation + summary)
- [x] Week analysis view
- [x] Settings view
- [x] Build + test validation
- [x] Reset all data (Settings → confirm modal → days cleared, goal/weight reset)
- [x] Weekly analysis: future days disabled + realized balance (only up to today)
- [x] Food vs. group entries (chooser + group form + grouped list display)
- [x] Rebrand "Calorie Counter" → "CalGoal" (app name, tab title, i18n, package.json, localStorage key)
- [x] Header layout: logo + name + tagline (left) · TR/EN + theme toggle (right); tagline hides on mobile
- [x] Weekly analysis: weeks with no entries (past/current/future) show a clean "no entries" state
- [x] Foods library (favorites): save / quick-add / manage + per-unit calorie entry (grams, servings…)
- [x] "Add Group" modal redesign (live total, compact rows, labeled mode toggle, sticky footer); "Add Food" modal aligned to match
- [x] Explicit deficit/surplus goal: maintenance calories + goal type + kcal/day → calculated daily target & weekly projection
- [x] "Add entry" modal refinement (cards, aligned grid, fuller unit list, pluralization, custom checkbox)

## Change Log (recent)

- **Rebrand**: "Calorie Counter" → "CalGoal" — header/logo, browser tab `<title>`, i18n
  `app.title` (both locales), `package.json` name, and the `localStorage` key
  (`calorie-counter` → `calgoal`).
- **Header layout**: logo/icon + name + tagline remain on the left; TR/EN switcher +
  theme toggle are grouped on the right. The tagline now hides below the `sm` breakpoint,
  and the controls use `shrink-0` + `gap-3` so nothing overlaps or wraps on small screens.
- **"Add entry" modal**: two-card layout ("This food" / "How much you ate"), aligned
  input grid, "Enter total calories" vs. "Calculate from serving" toggle, fuller unit
  list with no conversion, and pluralized unit labels.
