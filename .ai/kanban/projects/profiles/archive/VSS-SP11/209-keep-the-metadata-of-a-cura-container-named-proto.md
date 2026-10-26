---
id: 209
title: Keep the metadata of a Cura container named __proto__
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 9 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done (agent sp11-prf-209-210). `Object.create(null)` for both `native` objects in `quality/read.ts` (readCuraQualities, readCuraUserChanges) and `unmapped` in `materials/fdm-material.ts`. Tests: `test/quality.test.ts` (qualities and user changes keep a `__proto__` id as an own key), `test/fdm-material.test.ts` (a `<setting key="__proto__">` stays in native settings).
Mutation probes: `Object.create(null)` back to `{}` in read.ts: quality test fails; in fdm-material.ts: fdm test fails.
Bounds: no new input handled, only the container type of the output changes; existing limits untouched. The hostile input is the `__proto__` id/key itself, tested.
Verify (profiles-cura): lint, build pass; test 120/120; `node scripts/run.mjs checks` passes. CI gate platform: Linux (ubuntu); run here on macOS.
Release lines: CHANGELOG: "Fixed: a Cura container or fdm_materials setting named `__proto__` keeps its metadata in `native`." No export lines.

**Review passed (sp11-rev-prf-209-210)**
Ran in profiles-cura (macOS): `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 9 files, 120/120; `node scripts/run.mjs checks` exit 0.
Fix matches audit finding 9: `Object.create(null)` for `native` in `readCuraQualities` (read.ts:191) and `readCuraUserChanges` (read.ts:242) and for `unmapped` (fdm-material.ts:122). Material ids are `cura-material-<guid>`, so `res.native` there cannot take `__proto__`; the only other consumer (`export/cura/write.ts:72`) reads `native[id]`, unaffected.
Mutation probes (temp copy): read.ts:191 back to `{}` fails "keeps its metadata as an own key of native"; read.ts:242 back to `{}` fails the same test (it covers both readers); fdm-material.ts:122 back to `{}` fails "is kept in native settings". Hostile input is the `__proto__` id/key itself; no limits touched.
Note: read.ts:246 also adds `name: c.name` to the `definition_changes` native entry; not part of this card (another card in the module), left for its reviewer.
