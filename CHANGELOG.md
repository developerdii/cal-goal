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

### Fixed
- Weekly analysis now shows a clean "no entries" empty state (and hides the summary
  balance cards) for any week with no logged calories — past, current, and future weeks
  now behave consistently.
