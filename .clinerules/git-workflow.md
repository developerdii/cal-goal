# Git Workflow

This repo uses a `develop` → `main` flow. Apply it to every task, including commits and pushes.

## Branches
- All work happens on **`develop`**. If you find yourself on `main`, switch to `develop` first.
- **Never push directly to `main`.**
- `develop` → `main` is merged **only when the maintainer explicitly approves**. Never do it unprompted.
- `main` is production — pushing to it triggers the GitHub Pages deploy (`.github/workflows/deploy.yml`).
- Remote: `origin` → `github.com:developerdii/cal-goal.git`. Branches: `develop` (dev), `main` (production).

## Commits & pushes
- Conventional prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One logical change per commit.
- Push only to `origin develop`.
- Before finishing a task, run `npm test` and `npm run build`; both must pass.
