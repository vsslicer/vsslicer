---
id: 53
title: Write native export to Orca and Bambu JSON
type: feature
priority: P0
effort: L
model: opus
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [28, 136]
created: 2026-10-25
---

Writes `inherits`, `from`, arrays with `nil`, and rebuilds extruder-variant arrays from keyed values.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/export/orca/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] Import then export of every user preset fixture and 200 sampled vendor presets is byte-equivalent
- [x] An H2C dual-extruder preset's variant arrays are rebuilt from keyed values to the original array order
- [x] Numbers kept as the strings the source used

## Tasks

- [x] Write the JSON writer
- [x] Rebuild variant arrays
- [x] Round-trip tests

## Progress

Not started.

**sp11-prf-53 (2026-10-26):** done, verified. Notes: `.reference/notes/PRF-53-orca-json-export.md`.

- Code (`profiles-orca`, adapters): `src/adapters/export/orca/write-json.ts`. `readOrcaJson(bytes)` gives a preset's values (`"nil"` as `null`) and its native form (each top-level member's source text and the separators between them, plus indent and line ending). `writeOrcaJson(type, values, {native?, dialect?, slots?})` encodes keyed variant values back to arrays (`encodeVariants`, with `slots` from the flattened preset for a child without its own slot lists), writes `null` as `"nil"`, copies each unchanged member's source text, re-lays out only changed members in the file's own indent and line ending, cuts removed ones and appends new ones sorted. With no native form it writes the slicer's layout: sorted keys, Orca a tab (OrcaSlicer@09aa0114:src/libslic3r/Config.cpp:1553-1600), Bambu four spaces (BambuStudio@79df7ae:src/libslic3r/Config.cpp:1522-1571). `writeOrcaUserPreset(p)` writes a `readOrcaUserPresets` preset with `name`, `inherits` (`""` when standalone) and `from` (`"User"` by default, Preset.cpp:754-826). AGPL-3.0 provenance is in the file header.
- Why the native form: vendor files are hand formatted (inline arrays, mixed indents, a space before the colon, repeated keys in Bambu's), and `readOrcaTree` only gives flattened settings. Re-serialising alone reproduces Orca 14265 of 14348 files and Bambu 3119 of 3576. With the native form, a scratch probe round-trips every JSON file in both trees byte for byte: Orca 14420/14420, Bambu 3589/3589.
- AC1: `test/write-json.test.ts` round-trips 4 user preset fixtures (3 Orca with tabs, 1 Bambu with four spaces, laid out as the slicers write them, with `nil` arrays and H2C/H2D slot lists). Each goes through `readOrcaUserPresets` and then `writeOrcaUserPreset`, and comes out byte for byte with the native form and without it. The test also round-trips 200 evenly sampled vendor presets per ecosystem (OrcaSlicer@09aa0114, BambuStudio@79df7ae) plus every H2C/H2D file, each decoded with `decodeVariants` and re-encoded. Those vendor tests skip when `.reference` is absent, which is the case in CI.
- AC2: H2C keyed values, given in shuffled key order, are rebuilt to the original slot order, both over the native form and fresh. Editing one keyed value changes exactly one line. A child preset is encoded using its parent's slots. These tests run in CI on inline fixtures.
- AC3: a bare `0.10` and a `"0.20"` string keep their source text; editing one member reformats only that member.
- Bounds (rule 25): the input is capped at `TREE_LIMITS.maxFileBytes`; nesting deeper than `MAX_JSON_DEPTH` (64) is refused; there is one linear scan, with no regex on the input except the indent read from the prefix; `__proto__` keys stay data (null-prototype values). Repeated keys take the last value, as `JSON.parse` and nlohmann do, and every occurrence is written back. Invalid UTF-8, invalid JSON and a non-object give errors. Writing throws a RangeError where `encodeVariants` does.
- Mutation probes (rule 19; each change made in place, then restored and diffed). All 17 were KILLED: nil write-back, raw copy of unchanged members, earlier repeated-key occurrence kept, variant encoding, `slots` option, depth cap, size cap, BOM kept, new keys sorted, Bambu dialect, file eol, file indent, user `inherits` default, user `from` default, user `type`/`setting_id` from native, non-object refused, empty object.
- Verification: in the module, `pnpm install` OK; `pnpm build` passes; `pnpm test` passes 9 files, 126 tests (22 new). `pnpm exec eslint` and `prettier --check` pass on my files. `pnpm lint` as a whole fails only on prettier for `test/tuples/generate-golden.ts` and `test/tuples/oracle.ts`: another card's untracked work in progress, not mine. `cd vsslicer && node scripts/run.mjs checks` exits 0. CI gate runs on ubuntu-latest.
- Not done: no `.info` sidecar writer; no `Exporter` port class (later cards 107/134 compose one); new keys are appended rather than placed in sorted position inside an existing sorted file.

Release lines:

- CHANGELOG (Unreleased, Added): `Native export to Orca and Bambu Studio preset JSON: readOrcaJson keeps each member's source text, writeOrcaJson and writeOrcaUserPreset write inherits, from, "nil" and keyed extruder-variant values back to arrays; unchanged presets export byte for byte (PRF-53).`
- `src/index.ts`: `export * from './adapters/export/orca/write-json.ts';`

**Review passed (sp11-rev-prf-53)** (2026-10-26)

- Ran in `profiles-orca`: `pnpm install` OK, `pnpm build` OK, `pnpm lint` OK (eslint, prettier, tsc test config). `vitest run test/write-json.test.ts`: 22/22 pass, the two vendor round trips included (they ran against `.reference`, not skipped). Full `pnpm test`: 156/157. The one failure is `test/read-tree.test.ts` "counts links and stray files against maxFiles", which belongs to another card's uncommitted PRF-204 work (`pushCapped`, `load-tree.ts`), not this one. `node scripts/run.mjs checks` exits 1, only on `check-licence` for `modules/profiles-prusa/test/zz-h.test.ts` (an untracked file in another module, missing its SPDX header). Not this card.
- AC1: 4 user fixtures round-trip byte for byte, with the native form and without it. 200 sampled vendor presets per ecosystem plus every H2C/H2D file round-trip through `decodeVariants` and then `writeOrcaJson`. AC2: shuffled keyed H2C values rebuild the original slot order, and editing one value changes one line. AC3: the lexemes `0.10` and `"0.20"` are kept. All met.
- Upstream citations checked at OrcaSlicer@09aa0114 and BambuStudio@79df7ae: `j.dump(1, '\t')` at Config.cpp:1600, `std::setw(4) << j` at Bambu Config.cpp:1571, and `from_str`/`set_with_nil` in Preset.cpp:754-826. Layering: adapters only, no VS Code imports, no cross-module relative imports. AGPL header is present.
- Mutation probes, run in a `mktemp -d` copy. All 20 were killed: nil write (scalar), nil write (array item), nil read, raw copy when the value is unchanged, raw copy always, depth cap removed, depth cap off by one, size cap, BOM handling, new-key sort, Bambu indent, CRLF detection, `slots` option, `inherits` default, `from` default, repeated key taking the last value, removed member cut, `setting_id` write-back, and on the vendor tests: re-layout of every member, `encodeVariants` skipped.
- Hostile probes (rule 25): a seeded fuzzer built 2540 valid, non-empty JSON objects with mixed whitespace, CRLF, escaped quotes, trailing backslashes, `}],{[` inside strings, non-BMP characters, control characters, nested arrays and objects, and literals. Each one's values matched `JSON.parse` (nil mapped), it round-tripped byte for byte over its native form, and its fresh output read back to equal values. `[` nested 200000 deep is refused ("nested deeper than 64"), and 200000 members read fine.
- Non-blocking notes: (1) a JSON `null` in the source (`{"a": null}`) reads as `null` and so writes back as `"nil"`, which changes the bytes. No vendor or user file has one. (2) A native `{ }` with no members writes `{}\n`. Neither is in scope.
