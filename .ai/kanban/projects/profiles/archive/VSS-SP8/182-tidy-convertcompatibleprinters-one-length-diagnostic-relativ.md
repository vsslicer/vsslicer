---
id: 182
title: "Tidy convertCompatiblePrinters: one length diagnostic, relative .reference path, upstream rules in the doc comment"
type: bug
priority: P2
effort: XS
model: sonnet
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [124]
created: 2026-10-26
---

Follow-up from the PRF-124 review (sp8-reviewer-3, SP8): non-blocking notes on `convertCompatiblePrinters`.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/conditions/compatible-printers.ts` and its test (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [x] The "too long" diagnostic is pushed once when the length cap is hit, not once per remaining entry (test)
- [x] The real-profile test finds `.reference` relative to the repository (from the test file's URL), not by an absolute `/Users/...` path
- [x] The doc comment states the upstream rules not represented: a user printer is compatible when its parent is listed (OrcaSlicer@09aa0114 `src/libslic3r/Preset.cpp:899-906`), Bambu Studio rejects other vendors' presets (BambuStudio@79df7ae `Preset.cpp:800`), and the caller converts `compatible_printers_condition` only when the list is empty

## Progress

Not started.

Review (sp8-reviewer-7, 2026-10-26 07:53): PASS
1. One length diagnostic: a `tooLong` flag at `compatible-printers.ts:59` pushes the message once. The new test (`compatible-printers.test.ts:53`, 1000 x 200-char names against the 60 000 cap) checks for exactly one "too long" diagnostic and that the output still parses; the old code would have pushed several hundred.
2. Relative path: the test now builds the path with `fileURLToPath(new URL('../../../../.reference/...', import.meta.url))`, which goes test -> profiles-orca -> modules -> vsslicer -> repo root. A verbose run shows "real OrcaSlicer@09aa0114 BBL process profiles > compatible_printers of a real profile converts" passing, not skipped.
3. Citations checked read-only: OrcaSlicer@09aa0114b4e1 `src/libslic3r/Preset.cpp:899-906` is `is_compatible_with_parent_printer` (matches `inherits()` against the list); BambuStudio@79df7ae `src/libslic3r/Preset.cpp:800` is the `preset.vendor != active_printer.vendor` return-false (Orca comments it out at :910-913, so "Bambu Studio" is the right attribution); :804 applies the condition only when `!has_compatible_printers`.
Only the adapter layer changed; no index/CHANGELOG/package.json edits.
Ran: profiles-orca `pnpm test` (10 pass), `vitest --reporter=verbose` on the file, `pnpm lint`, `pnpm build`; `node scripts/run.mjs checks` (exit 0).
