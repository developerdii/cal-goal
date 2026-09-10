# Coding Conventions

## Vue
- Use Vue 3 Composition API with `<script setup>`.
- Follow existing component patterns: `defineProps`/`defineEmits`, Tailwind classes, dark-mode support.

## i18n
- Every user-facing string must go through vue-i18n (`useI18n()`).
- Add keys to **both** `src/i18n/locales/en.json` and `src/i18n/locales/tr.json` and keep them in sync.
- Reuse existing keys (e.g. `common.today`) before adding new ones.

## Styling
- Use Tailwind CSS. Always include `dark:` variants so dark mode works.
- Reuse the card/button/input styles already present in `src/components/` instead of inventing new ones.

## Formatting & dates
- Format numbers via `src/utils/format.js` (`formatKcal`, `formatSignedKcal`, `formatSignedWeight`, …) with the active `locale`.
- Work with dates via `src/utils/date.js` (`toDateKey`, `parseDateKey`, `addDays`, `getWeekDays`, `startOfDay`).

## Testing
- Add a Vitest test in `tests/` for any new pure logic in `src/utils/`.
- Follow the existing test style (descriptive `it(...)` names, no fixtures unless needed).
