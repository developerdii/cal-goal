# Changelog

All notable changes to this project are documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- **Foods library (favorites)**: save foods/groups while logging ("Save to my foods"),
  quick-add them from the add screen, and manage them on a new "Foods" tab.
- **Per-unit calories**: log foods by amount (e.g. "100 g = 110 kcal") and enter a
  quantity (e.g. 250 g) to auto-calculate calories — for single foods and group items.
- **Saved-foods picker in add flow**: "Add food"/"Add group" show the last 5 saved
  items (foods vs. groups respectively) with quick-add (+) and "fill form" (edit)
  actions; each group item can also be filled from saved foods.
- **"Add entry" modal refinement**: "This food" and "How much you ate" cards with an
  aligned grid, pluralized unit labels, a fuller unit list (`g, ml, oz, cup, tbsp, tsp,
  piece, slice, serving`), and a custom-styled "Save to my foods" checkbox.

### Changed
- Rebranded the application from **"Calorie Counter"** to **"CalGoal"**:
  - header/logo area, browser tab `<title>`, i18n (`en.json` + `tr.json`), and `package.json` name.
- Renamed the `localStorage` key from `calorie-counter` to `calgoal`.
  - **Note:** existing data stored under the old key is not migrated automatically.
- Header layout updated: logo + name + tagline on the left; TR/EN switcher + theme
  toggle grouped on the right; tagline now hides on small screens to stay responsive.
- **"Add Group" modal redesigned**: live group total, compact single-line item rows,
  a clear labeled kcal/amount toggle, a sticky footer (BaseModal now supports a footer
  slot + scrollable body), a grouped "Save to foods" card, and tighter spacing with
  subtler input focus.
- **"Add Food" modal updated to match**: sticky footer with a grouped "Save to foods"
  card, subtler input focus, and a labeled kcal/amount mode toggle.
- **Calorie goal redesigned**: replaced the single raw "goal" number with an explicit
  "maintenance calories" input + goal type (maintain / deficit / surplus) + a kcal/day
  amount. The daily target is now calculated, and weekly weight projection uses actual
  intake vs. maintenance (7,000 kcal ≈ 1 kg). Old single-goal data is migrated
  automatically (treated as maintenance with "maintain" goal).
- **Saved-foods picker redesigned**: the add flow now always shows a "Saved foods"
  section with a clear empty state ("No saved foods yet"), the last 5 items, and a
  "See all" action that opens a searchable modal when more are available. The confusing
  per-item star button in "Add group" was replaced by a top-level "Add from saved
  foods" button that opens the same searchable modal.
- **"Add entry" modal**: split fields into "This food" / "How much you ate" cards with
  right-aligned inputs; relabeled the toggle to "Enter total calories" / "Calculate from
  serving" (default serving); default unit `g`; amount eaten starts empty and falls back
  to the reference amount.

### Fixed
- Weekly analysis now shows a clean "no entries" empty state (and hides the summary
  balance cards) for any week with no logged calories — past, current, and future weeks
  now behave consistently.
- Calories field placeholder is now "e.g. 89" instead of a numeric-looking "120", and
  Save shows an inline "Enter a name" error (with focus) instead of being silently
  disabled.
