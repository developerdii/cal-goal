---
name: release-to-main
description: Merge develop into main and ship a release. Use when the user asks to merge to main, release, deploy, ship changes, or says "birleştir" / "maine birleştir" / "pushla".
---

# Release to Main

The repo uses a `develop` → `main` flow. `main` is production — a push triggers the GitHub Pages deploy via `.github/workflows/deploy.yml`. Follow this checklist whenever a release / merge to main is requested.

## 1. Confirm approval
- Only proceed if the maintainer has explicitly approved merging to `main`. If unsure, ask first.
- Make sure all work is committed to `develop` (you should be on `develop`).

## 2. Sync `.clinerules/`
- Re-read `.clinerules/*.md` against the actual code and update anything that no longer matches (schema, stores, utils, routes, tech stack, domain math). Commit any fixes to `develop` before merging.

## 3. Validate
```bash
npm test        # all tests must pass
npm run build   # production build must succeed
```

## 4. Merge & push
```bash
git checkout develop
git fetch origin
git checkout main
git merge --ff-only develop     # fast-forward keeps main == develop
git push origin main
git checkout develop
git push origin develop
```
- Prefer a fast-forward merge so `main` and `develop` end at the same commit.

## 5. Verify & report
- Confirm sync: `git rev-list --left-right --count develop...main` should print `0  0`.
- Report the released commit hash and any notes (e.g. which features were included).
