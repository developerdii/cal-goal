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

## Linting
- ESLint flat config (`eslint.config.js`): `eslint-plugin-vue` `flat/recommended` (Vue 3 standard) + `@eslint/js` core recommended rules.
- Formatting-only rules are disabled (no Prettier; the project keeps its own hand-formatted style): `vue/max-attributes-per-line`, `vue/singleline-html-element-content-newline`, `vue/html-self-closing`, `vue/attributes-order`.
- Single-word components `App` and `Icon` are allowed (`vue/multi-word-component-names` ignores them).
- In templates, use **kebab-case** for event names and directive args: `emit('quick-add')` / `@quick-add`, and `v-model:per-kcal` (the matching `defineModel('perKcal')` name stays camelCase).
- Commands: `npm run lint` (strict, `--max-warnings=0`) and `npm run lint:fix`.
- CI fails if lint or tests fail — keep both green before pushing.
