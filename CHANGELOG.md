# Changelog

All notable changes to this project are documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- Rebranded the application from **"Calorie Counter"** to **"CalGoal"**:
  - header/logo area, browser tab `<title>`, i18n (`en.json` + `tr.json`), and `package.json` name.
- Renamed the `localStorage` key from `calorie-counter` to `calgoal`.
  - **Note:** existing data stored under the old key is not migrated automatically.
- Header layout updated: logo + name + tagline on the left; TR/EN switcher + theme
  toggle grouped on the right; tagline now hides on small screens to stay responsive.

### Fixed
- Weekly analysis now shows a clean "no entries" empty state (and hides the summary
  balance cards) for any week with no logged calories — past, current, and future weeks
  now behave consistently.
