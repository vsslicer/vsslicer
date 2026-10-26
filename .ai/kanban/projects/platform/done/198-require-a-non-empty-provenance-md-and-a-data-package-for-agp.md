---
id: 198
title: Require a non-empty PROVENANCE.md and a data package for AGPL-3.0-only in check-licence
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 5 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done (sonnet worker). check-licence now requires a non-empty PROVENANCE.md and package name in an allowlist (@vsslicer/profiles-data-orca, @vsslicer/profile-catalogue-data); both still pass with the working-tree tooling. Chose a name allowlist over refusing src/, since both data packages have src/. Bounds: no new input parsing (one stat size check). Tests: 2 new in test/licence.test.mjs.
Mutation probes: dropping the size===0 check fails the empty-PROVENANCE test; dropping the allowlist check fails the allowlist test; both restored.
Verify: tooling lint, build, test 72 pass 0 fail; `node scripts/run.mjs checks` passed.

**Review passed (sp10-rev-prf-197-plt-198)**

Ran in `tooling`: `pnpm install` (ok), `pnpm lint` (eslint, prettier, check-licence clean), `pnpm build` (node --check ok), `pnpm test` (72 pass, 0 fail). `node bin/check-licence.mjs modules/profiles-data-orca modules/profile-catalogue-data` returns 0; `node scripts/run.mjs checks` passed.
Design: finding 5 offers two fixes, a name allowlist or refusing `-only` for a package with `src/`. Both data packages have `src/`, so the allowlist is the only one that works. A new data package has to edit tooling and release it. That is acceptable: an `-only` package is an owner decision (Q20/Q21), so the change should be deliberate, and the code comment says so. KISS holds: one Set and one check.
Mutation probes (temporary, restored, `cmp` clean): dropping `statSync(prov).size === 0` makes the empty-PROVENANCE test fail (13 pass, 1 fail); replacing the allowlist check with `false` makes the allowlist test fail (13 pass, 1 fail).
Hostile probes: `name` given as an array is refused by the allowlist. Note, not blocking: `PROVENANCE.md` as a *directory* in an allowlisted package passes, because a directory's size is not 0. `statSync(prov).isFile() && size > 0` would close that. It only matters inside the two named packages.
CHANGELOG line present under `## Unreleased`.
