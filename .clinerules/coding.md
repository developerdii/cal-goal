# Coding Conventions

## Vue
- Vue 3 Composition API with `<script setup>`.
- Props/emits via `defineProps`/`defineEmits`; follow existing component patterns.

## i18n
- Every user-facing string via vue-i18n (`useI18n()`).
- Add keys to **both** `src/i18n/locales/en.json` and `tr.json`; keep them in sync.
- Reuse existing keys (e.g. `common.today`) before adding new ones.

## Styling
- Tailwind only. Always add `dark:` variants.
- Reuse existing card/button/input styles from `src/components/` instead of inventing new ones.

## Dates, numbers, IDs, errors
- Dates: `src/utils/date.js` (`toDateKey`, `parseDateKey`, `addDays`, `getWeekDays`, `startOfDay`, `isFutureDay`); keys are local `YYYY-MM-DD`. No raw `Date` arithmetic.
- Numbers: `src/utils/format.js` (`formatKcal`, `formatSignedKcal`, `formatSignedWeight`, `formatDayMedium`, …) with the active `locale`.
- IDs: `createId()` from `src/utils/id.js`.
- Auth errors: `authErrorKey()` from `src/utils/authErrors.js`.

## Testing
- Add a Vitest test in `tests/` for any new pure logic in `src/utils/`.
- Follow existing style (descriptive `it(...)` names).
