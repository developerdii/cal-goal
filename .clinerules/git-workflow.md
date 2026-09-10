# Git Workflow

This project uses a `develop` → `main` flow. Apply it to every task, including commits and pushes.

## Branch rules
- All work happens on the **`develop`** branch. If you find yourself on `main`, switch to `develop` first.
- **Never push directly to `main`.**
- `develop` → `main` is merged **only when the maintainer explicitly approves** it. Do not do this on your own.
- `main` is the production branch — pushing to it triggers the GitHub Pages deploy.

## Commits
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- One logical change per commit.
- Before finishing a task, run `npm test` and `npm run build` and confirm both pass.
