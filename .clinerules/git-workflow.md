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
- Before finishing a task, run `npm run lint`, `npm test`, and `npm run build`; all must pass.

## CI pipeline
- `.github/workflows/ci.yml` runs on every push to `develop` and every PR targeting `main` / `develop`.
- It runs `npm run lint` (strict, `--max-warnings=0`), `npm test`, and `npm run build`. All must pass.
- Merges to `main` stay **manual** (maintainer approval only). CI **gates** the PR/merge — it does **not** auto-merge.
- To enforce the gate, enable branch protection on `main` requiring the `CI` status check (GitHub repo → Settings → Branches → Require status checks). This is a repo-settings step, not code.

## Keep `.clinerules/` in sync
- `.clinerules/*.md` is the living source of truth for how I understand this project. Keep it accurate.
- Whenever the app changes (new feature, data model, schema, store, util, route, or convention), update the relevant `.clinerules/*.md` file **in the same change**.
- Before merging `develop` → `main`, re-read `.clinerules/` against the actual code and fix any rule that no longer matches (schema, stores, utils, routes, tech stack, domain math).
