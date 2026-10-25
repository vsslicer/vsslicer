---
id: 77
title: Join chunks without spreading arrays in collect
type: bug
priority: P0
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-77-worker
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `gcode-parser`, application layer. A 4 MB file of 840,000 `M400` lines makes `collect` throw "Maximum call stack size exceeded" (finding 2). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [x] `collect` handles a chunk with 1,000,000 markers
- [x] A regression test with 300,000 marker lines passes

## Tasks

- [x] Replace the four `push(...x)` calls with loops
- [x] Regression test
- [x] Release a patch version

## Progress

Done. `collect` now appends layers, markers, diagnostics, thumbnails and object ranges with a loop helper (`append`) instead of `push(...x)`; that was five calls (the four named plus `known.ranges.push(...o.ranges)`). Grep of all `src` found no other unbounded spread (`Math.max(...)`, `apply`); remaining spreads are array/object literals.
Verified: new `test/collect.test.ts` (300,000 `M400` lines through parse+collect; synthetic chunk with 1,000,000 markers and object ranges, also merged across two chunks) failed with "Maximum call stack size exceeded" before the fix, passes after. Lint, 271 tests, build pass; empty-store `pnpm install --frozen-lockfile` from a copy without node_modules passes, tests pass there. Published `@vsslicer/gcode-parser@0.8.1` to the local registry only. Timing tests (summary 100 MB, worker corpus) can flake while other workers load the machine.
Files: vsslicer/modules/gcode-parser/{src/application/collect.ts,test/collect.test.ts,package.json,CHANGELOG.md}, .reference/notes/GCP-77-collect-spread.md.

Review fixes: root cause was that 0.8.1 was published with a stale `dist`. Added `"prepack": "pnpm build"` to `vsslicer/modules/gcode-parser/package.json`, so `pnpm pack`/`pnpm publish` always rebuild (checked: touched `src/application/collect.ts`, removed `dist`, `pnpm pack` regenerated it). Bumped to 0.8.2 with a CHANGELOG entry ("0.8.1 shipped a stale build; use 0.8.2"). Lint, 271 tests and build pass; empty-store `pnpm install --frozen-lockfile` from a copy without node_modules passes and tests pass there. Published `@vsslicer/gcode-parser@0.8.2` (this module only). Downloaded it with `npm pack` from the registry: `dist/application/collect.js` has `const append` and no `push(...` call (only the explanatory comment mentions it); the audit repro (840,000 `M400` lines, 4.2 MB, parse+collect) against the unpacked published dist returns 840,000 markers with no error. 0.8.1 stays in the registry, stale; use 0.8.2.
Files: vsslicer/modules/gcode-parser/{package.json,CHANGELOG.md}.
