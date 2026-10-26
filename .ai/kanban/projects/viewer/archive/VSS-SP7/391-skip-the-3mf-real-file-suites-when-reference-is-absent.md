---
id: 391
title: Skip the 3mf real-file suites when .reference is absent
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-3mf
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: 3mf (tests). Finding 2 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix
- [x] The real-file suite is skipped (describe.skipIf) when its files are absent, and committed fixtures under test/fixtures cover the production path in a clean checkout (no path outside the module)
- [x] Every committed sample has a PROVENANCE line with source repo@commit, path and licence; AGPL-3.0 samples are test-only and not in package.json files

## Tasks

- [x] Fix as the audit describes

## Progress

Done. Added test/fixtures/real/ (pa_pattern, production_ext, booleans_operations, CubeDisplacement_oneside; each <200 KB, PROVENANCE.md with repo@commit, path, licence). test/production.test.ts: committed fixtures always run; OrcaBadge (798 KB) stays in a describe.skipIf(!existsSync). package.json files is dist/LICENSE/README only, so test/ is not shipped.
Verified: vitest on production.test.ts passes 19; copy of the module in scratch (so .reference is not reachable) gives 18 passed, 1 skipped. Before: the old suite failed in a clean checkout (audit).
Shared-file changes: none.

Review (sp7-rev-3mf): PASS. Copied the module (no node_modules/dist, node_modules symlinked) to a scratch dir where `../../../../.reference` does not resolve: full suite 148 passed, 3 skipped, 10 files passed; production.test.ts 18 passed, 1 skipped (OrcaBadge). All four fixtures are byte-identical to the upstream files, and each PROVENANCE commit matches `git rev-parse HEAD` of its clone (BambuStudio 79df7ae, PrusaSlicer 30ef591, 3mf-spec-booleans 7b70e6e, 3mf-spec-displacement 0e2d3fc); licences checked against the upstream LICENSE files (AGPL-3.0 x2, BSD-2-Clause x2). Sizes 23 KB, 1.6 KB, 99 KB, 118 KB. package.json `files` is dist/LICENSE/README only. Fix in place (attribution only): added the BSD-2-Clause copyright lines (3MF Consortium 2021/2018) to test/fixtures/real/PROVENANCE.md, since BSD-2 redistribution must keep the notice. Note: opc.test.ts, editPackage.test.ts and resolveProject.test.ts still read .reference but already skip when it is absent.
