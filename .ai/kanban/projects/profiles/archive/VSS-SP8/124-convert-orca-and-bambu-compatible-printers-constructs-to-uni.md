---
id: 124
title: Convert Orca and Bambu compatible_printers constructs to unified conditions
type: feature
priority: P0
effort: S
model: sonnet
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [120, 135]
created: 2026-10-25
---

The Orca/Bambu row of the `profiles.md` §6 conversion table: `compatible_printers: [names]` to `printer.id in [...]` after name-to-id mapping.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/conditions/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] `compatible_printers` converts exactly when every name resolves; an unresolved name gives a diagnostic and a lossy flag
- [x] Every output parses and evaluates with the `profile-api` parser (release 0.1.0)

## Tasks

- [x] Write the converter
- [x] Write the tests

## Progress

Not started.

Review (sp8-reviewer-3, 2026-10-26 07:40): PASS

Checked: both acceptance criteria against code and tests; `pnpm test` (9 passed), `pnpm lint`, `pnpm build` in `profiles-orca`; `node scripts/run.mjs checks` (exit 0). Layer is `adapters`, no cross-module file imports, no VS Code API. Upstream: `OrcaSlicer@09aa0114:src/libslic3r/Preset.cpp:909-941` and `BambuStudio@79df7ae:src/libslic3r/Preset.cpp:798-820`: a non-empty `compatible_printers` decides alone (the condition is evaluated only when the list is empty) and an empty list means all printers, which matches the converter. Hostile probe in scratch, parsed and evaluated with profile-api 0.1.0: ids with `'`, `\`, `\n`, `\t`, `\r`, NUL, U+2028, emoji, a lone surrogate, `] or printer.id == "z` and `' or true or '` each match only themselves; 2000, 5000 and 1 000 000 entries of 256 `x`, `'` or `\` characters stay under 60 000 characters (parser limit `MAX_SOURCE_LENGTH = 64 * 1024`, `parser.js:13`), parse, take 40 ms or less, and are flagged lossy. Local `quoteLiteral` and the 60 000 constant: acceptable for 0.1.0; the cap is computed exactly, so it is safe.

Notes, not blocking (follow-up cards):
1. `src/adapters/conditions/compatible-printers.ts:23-26`: the doc comment should say the converter covers only the list. When it returns no condition, the caller still has to convert `compatible_printers_condition`; when it returns one, the caller must ignore the condition (upstream precedence). Upstream also counts a user printer as compatible when its parent (`inherits`) is listed (`Orca Preset.cpp:899-906`, `is_compatible_with_parent_printer`), and Bambu Studio rejects presets from a different vendor (`BambuStudio Preset.cpp:800`). Neither is representable here, so say so in the comment or in `profiles.md` §6.
2. `compatible-printers.ts:47-49`: once the length cap is hit, the "condition too long" diagnostic is pushed once for every remaining entry (about 1 885 identical strings in the probe). Push it once and stop.
3. `test/compatible-printers.test.ts:50`: the real-profile test uses an absolute `/Users/jkiraly/...` path, so it is skipped everywhere else, including CI. Resolve it relative to the repository.
4. `package.json` and `pnpm-lock.yaml` are modified (the `@vsslicer/profile-api ^0.1.0` dependency). Workers must not edit these; the coordinator should confirm the edit is theirs.
5. Once profile-api 0.2.0 is out: import `MAX_SOURCE_LENGTH`, and move the literal quoting into profile-api, which owns the lexer, instead of the two copies here and in `profiles-cura`.
