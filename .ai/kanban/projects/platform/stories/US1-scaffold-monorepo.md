---
id: US1
title: A developer clones the repository and builds, lints and tests an empty workspace with one command
status: reviewed
epic: VSS:E1
---

A VSSlicer contributor (human or agent) clones the public repository and gets the agreed layout, one TypeScript, lint and format configuration, a pinned Node and a Turborepo task graph, so every other project board starts from the same ground. This story also records the monorepo decision in the repository and rejects phantom dependencies.

## Acceptance criteria

- [ ] From a clean clone, `pnpm install --frozen-lockfile && pnpm turbo run lint build test` passes locally on a sample library and a sample extension
- [ ] Removing `turbo.json` leaves `pnpm -r run build` working (every task is a plain package script)
- [ ] A library importing a package missing from its own `package.json` fails `build` (phantom dependency regression test)
- [ ] The public GitHub repository exists with `main` protected, and the layout (`packages/ extensions/ apps/ fixtures/ tools/`) and the monorepo decision are written in `CONTRIBUTING.md` and `.ai/instructions.md` "Build and test"
- [ ] Root `LICENSE` holds the AGPL-3.0 text and every workspace `package.json` declares `AGPL-3.0-or-later`

## Out of scope

- npm publishing of libraries; remote Turborepo cache; the CI workflow (US2).
