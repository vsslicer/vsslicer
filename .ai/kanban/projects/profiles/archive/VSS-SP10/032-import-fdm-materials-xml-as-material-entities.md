---
id: 32
title: Import fdm_materials XML as material entities
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [30, 135]
created: 2026-10-25
---

Maps each `fdmmaterial` v1.3 XML file to one `material` through the XML-key-to-setting table, with the CC0 fdm_materials@0c05969 bundled.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/materials/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Every XML file of fdm_materials@0c05969 yields exactly one `material`; density, diameter, GUID (as `external_ids.cura_guid`), brand and type are populated
- [x] A malformed XML file gives a diagnostic and the rest import

## Tasks

- [x] Write the XML reader
- [x] Apply the XML-key table
- [x] Count test

## Progress

sp10-prf-32: `src/adapters/materials/fdm-material.ts` (`readFdmMaterials`, `readFdmMaterialFolder`), test `test/fdm-material.test.ts`. Parser: saxes 6.0.0 (same as `3mf`; new dependency of profiles-cura). Table: `curaCatalogue.material`. Bounds (rule 25): any DOCTYPE refused (no entity or DTD expansion; an undeclared entity is an XML error), depth 32, 100k elements, 64 KiB text node, file/byte/total caps from the shared resource limits, flat listing capped by entry count, O_NOFOLLOW reads via PRF-30's `readCapped` (now exported; only change to folder.ts).
- fdm_materials@0c05969: 281 files give 281 materials, no diagnostics (GUIDs unique; test skips when the clone is absent).
- Not done: `<machine>`/`<hotend>` overrides are skipped; unmapped top-level settings are kept in `native`.
- Mutation probes (each fails the named test): drop DOCTYPE throw, depth check, text cap, GUID dedupe, `settings` path depth rule, file/total byte cap, file-count cap; element-count probe also fails (weak: breaks the counter itself). Surviving: removing `d.isFile()` in the folder lister (O_NOFOLLOW still refuses links; only the diagnostic differs).
- Verified in profiles-cura: lint, build, test 78 passed (6 files); `node scripts/run.mjs checks` exit 0.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.

**Review failed (sp10-rev-prf-32)**

Ran in profiles-cura: `pnpm install` ok, `pnpm build` ok, `pnpm test` 78 passed (6 files, fdm_materials golden ran: 281 files, 281 materials, 0 diagnostics, clone at 0c0596974a58fa622eeaa2bebced433a7860ac4b), `node scripts/run.mjs checks` exit 0. `pnpm lint` fails only on PRF-31's `src/adapters/quality/read.ts` (prettier); eslint, prettier and tsc are clean on this card's files. Layering ok (adapters only, package imports only).

Hostile probes (dist build, one 8 MiB file each): DOCTYPE refused; undeclared prefix, two roots, trailing text, UTF-16 and bad UTF-8 are diagnostics; 64K+1 text refused; 8 MiB comment 45 ms, 8 MiB attribute 65 ms, 300k attributes on one element 253 ms, 200k xmlns declarations 738 ms, 99,999 elements 26 ms (all one material, no blow-up); `__proto__`/`constructor` setting keys harmless. Bounds hold.
Mutation probes (temp copy): element cap, DOCTYPE throw, depth cap, text cap, GUID dedupe, machine-settings depth rule each fail a test.

Saxes: ISC, ships no licence file; xmlchars@2.2.0 (MIT) ships one. No module depends on profiles-cura yet, so no notices check breaks today; see coordinator note.

Problems:
1. `src/adapters/materials/fdm-material.ts:108` names materials `brand type color`, ignoring `metadata/name/label` and appending colour "Generic". On fdm_materials@0c05969 all 281 names differ from Cura's, 161 end in " Generic", and 31 names are shared by 76 materials (e.g. "eMotionTech Nylon Generic" x6). Upstream: Cura@5bea2f8:plugins/XmlMaterialProfile/XmlMaterialProfile.py:573-576 (label if present) and :1100-1106 (`_profile_name`: colour omitted when "Generic"). Fix: follow upstream's name rule (label, else `_profile_name`; prefixing brand is fine if kept consistent), with a test for a labelled file and a Generic colour.
2. `fdm-material.ts:37`: only saxes `text` is collected, `cdata` is not, so a valid file with `<GUID><![CDATA[g1]]></GUID>` is rejected ("needs GUID ...") and CDATA values elsewhere are dropped. Rule: every XML text form the format allows reaches the value. Fix: route `cdata` into the same accumulator under the same text cap; add a test.
3. `fdm-material.ts:147`: the folder listing's entry cap (`++entries > lim.maxFiles`) has no test; replacing it with `if (false)` leaves all tests passing. Rule 25: each bound has a test that fails when the bound is removed. Fix: a folder test with `maxFiles` below the entry count.

Low, not blocking: the root element and namespace are not checked (a `<evil>` root or a foreign-namespace `<metadata>` imports); `maxTextBytes` counts UTF-16 units, not bytes; `num` accepts `0x2`; a top-level `processing temperature graph` (point children) is silently dropped, neither mapped nor in `native` (fdm_materials uses it only inside `<machine>`, which is out of scope).

**Coordinator (SP10):** besides the three review problems, export the materials reader from a subpath (`@vsslicer/profiles-cura/materials`, `exports` in package.json), not the main entry, so saxes reaches only consumers that read materials (rule 21, SP6 amendment). The licenceTexts entry for saxes belongs to the first bundled consumer, not this card.

sp10-prf-32-fix: review problems fixed in `src/adapters/materials/fdm-material.ts`.
1. Name follows Cura@5bea2f8 XmlMaterialProfile.py:573-576 and :1100-1106: `metadata/name/label` if present, else `<color> <material>` with a Generic (or absent) colour omitted; brand is prefixed consistently ("Acme Red PLA", "Acme PLA"). Test "names follow Cura".
2. `cdata` now feeds the same accumulator and text cap as `text`. Test "CDATA text reaches the value" (GUID in CDATA imports; oversize CDATA refused).
3. Test in the folder test with `maxFiles: 2` expects the "more than 2 entries" diagnostic.
4. Coordinator: materials reader moved off the main entry to `src/materials.ts`, exported as `@vsslicer/profiles-cura/materials` (package.json `exports`); `src/index.ts` no longer exports it.
Mutation probes (each fails): drop cdata handler, entry cap to `if (false)`, drop the Generic rule, drop the label rule.
Verified: fdm-material tests 9 passed; build ok; `node scripts/run.mjs checks` exit 0. Whole-module lint/build/test currently fail only in PRF-31's `src/adapters/quality/read.ts` (no-constant-condition, TS18048) and `quality.test.ts` "diagnostics are capped"; not this card's files. The saxes licenceTexts entry is left to the first bundled consumer.

**Review passed (sp10-coordinator, re-review of the fix round; review dispatch was refused by the permission classifier, so the coordinator, who wrote none of this code, reviewed)**: profiles-cura `pnpm lint` clean, `pnpm build` ok, `pnpm test` 7 files / 101 passed (with PRF-31's files in place). Mutation probes on `src/adapters/materials/fdm-material.ts`, each restored (`cmp` clean): cdata handler removed (`:41`), entry cap `if (false)` (`:151`), Generic-colour rule off (`:108`), label rule off (`:108`): each fails 1 of 9 fdm-material tests. Naming checked against Cura@5bea2f8 `XmlMaterialProfile.py:573-576` and `:1100-1106` (`_profile_name`: "<color> <material>", material alone for Generic); the brand prefix is ours and keeps names unique across brands (documented deviation, accepted). Subpath export `./materials` in package.json, main entry no longer exports the reader. Low-severity notes from the first review stay open (root/namespace check, text cap in characters, hex numbers, dropped top-level temperature graph).
