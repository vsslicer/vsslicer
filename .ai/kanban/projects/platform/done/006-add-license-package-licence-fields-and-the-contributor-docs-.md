---
id: 6
title: "Add LICENSE, package licence fields and the contributor docs skeleton"
type: docs
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-6-worker
depends_on: [2]
created: 2026-10-25
---

Puts the AGPL-3.0 text at the repository root (for GitHub's detection) and in every module, `"license": "AGPL-3.0-or-later"` in every module's `package.json`, and starts `CONTRIBUTING.md` and the `.ai/instructions.md` "Build and test" section with the decisions this epic makes (independent modules and the local registry, D12; layout; Node pin; DCO per D10). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] `LICENSE` at the repository root and in every module is the unmodified AGPL-3.0 text
- [x] Every module's `package.json` carries the licence expression
- [x] `CONTRIBUTING.md` explains setup, layout, DCO sign-off, the version-bump rule and the independent-module decision with rejected alternatives (workspace, Turborepo, `link:` dependencies)
- [x] `.ai/instructions.md` "Build and test" lists the real commands

## Tasks

- [x] Add LICENSE and fields
- [x] Write `CONTRIBUTING.md`
- [x] Update `.ai/instructions.md` Build and test
- [x] Add SPDX header to existing source files

## Progress

Done under the module model (D12). Verified: `node scripts/run.mjs ci`, `test`, `build` and `test --changed HEAD` pass with the registry running; `cd modules/example && pnpm install && pnpm test && pnpm build` passes standalone.

- `LICENSE`: unmodified AGPL-3.0 text from gnu.org (661 lines) at the repository root (GitHub detection) and in each module; `LICENSE` added to each module's `files`.
- Every module `package.json` and `vsslicer/scripts/package.json` carry `"license": "AGPL-3.0-or-later"`; SPDX headers added to the two shell scripts (all JS already had them).
- `CONTRIBUTING.md`: setup, layout, architecture pointer, DCO (`git commit -s`, D10), version-bump rule and `<name>@x.y.z` tags, the independent-module decision with rejected alternatives (workspace + Turborepo, `link:`/`file:`, GitHub Packages; D12), and "Repository: no remote yet" (Q7).
- `.ai/instructions.md` "Build and test" lists the real commands.
- Adding `LICENSE` to `@vsslicer/example`'s tarball changed its integrity; `example-extension/pnpm-lock.yaml` was regenerated against a fresh registry and verified with an install from an empty store (the coordinator's fix; the guard is PLT-20).

Files: `LICENSE`, `CONTRIBUTING.md`, `vsslicer/modules/*/LICENSE`, `vsslicer/modules/*/package.json`, `vsslicer/modules/example-extension/pnpm-lock.yaml`, `vsslicer/scripts/registry.sh`, `vsslicer/scripts/github/apply-repo-settings.sh`, `.ai/instructions.md`.
