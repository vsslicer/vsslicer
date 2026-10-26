---
id: 205
title: Look up physical printer host_type by own key only
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 5 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done (sp11-prf-205-207). `Object.hasOwn(HOST_MAP, f.hostType) ? ... : undefined` in `src/adapters/physical/read.ts`; both INI and JSON readers go through `build`. Test `host_type lookup (PRF-205)` (4 keys x INI+JSON: no connection, no credential, unknown-type diagnostic). Bounds: no new input handling; the host_type diagnostic still slices to 64 chars.
Mutation probe: HOST_MAP[f.hostType] restored -> 4 tests fail. Platform of CI gate: Linux (checks run locally on macOS).
Verify: profiles-prusa `pnpm build` ok, `pnpm test` 250 passed (11 files), `node scripts/run.mjs checks` ok. `pnpm lint` fails only on prettier for src/adapters/export/prusa/types.ts (another card's file, not touched); my files lint clean.
Release lines: CHANGELOG: "Fixed: a physical printer host_type of constructor, toString or __proto__ no longer yields a non-string host type with a credential attached." No export lines.

**Review passed (sp11-rev-prf-205-207)**
Ran in profiles-prusa: `pnpm install` ok, `pnpm build` ok, `pnpm test` 281/284 (the 3 failures are all in `test/adapters/export-prusa.test.ts`, another card's untracked export work), physical+import tests 48/48, `pnpm lint` fails only on `src/adapters/export/prusa/export.ts:51` (no-control-regex, other card); eslint+prettier clean on `src/adapters/physical` and `test/adapters/physical.test.ts`; `node scripts/run.mjs checks` ok.
Fix matches audit finding 5 exactly (`read.ts:60`, `Object.hasOwn` guard); both INI and JSON readers reach it through `build`. Mutation probe: restoring `HOST_MAP[f.hostType]` fails 4 tests (constructor, toString, hasOwnProperty, __proto__, each over INI and JSON). Bounds: no new input handling. Layering: adapters only, no cross-module imports.
