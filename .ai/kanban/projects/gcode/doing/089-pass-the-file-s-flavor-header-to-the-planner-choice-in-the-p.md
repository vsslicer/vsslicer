---
id: 89
title: "Pass the file's ;FLAVOR: header to the planner choice in the preview"
type: bug
priority: P1
effort: M
model: opus
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-preview (application); may need gcode-api/gcode-parser. Finding 2 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] A ;FLAVOR:Klipper file without a config block is timed by the Klipper planner, and Cura files stop showing 'marlin assumed' when the header names the flavour (test)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

**Part A (gcode-api, gcode-parser): done. Part B (gcode-preview): pending, after the coordinator releases part A.**

Done (part A):
- gcode-api (domain): `flavourName?: string` on `Chunk` and `ParsedFile`, documented: the flavour name the file states as
  written and trimmed (`;FLAVOR:` or `; gcode_flavor =`), the last one wins, absent when none; pass it as gcode-planner's
  `resolveLimits({ flavour })`. Shape test updated.
- gcode-parser (domain/application): `SlicerTags` records the last non-empty name it reads; every chunk from then on carries
  `flavourName`; `collect` sets `ParsedFile.flavourName` from the last chunk that carries one. The parser's `flavour` option
  does not change it. Builds against gcode-api 0.5.0 too (local `NamedChunk = Chunk & { flavourName?: string }` in
  `chunk-writer.ts`, marked as a shortcut to drop once the range requires the new gcode-api).
- Header vs config block: both feed the same reader; the later one in the file wins, for the units and for `flavourName`
  alike. Passed to `resolveLimits`, it beats `config.gcode_flavor`; the two differ only when a `;FLAVOR:` header comes after
  a `; gcode_flavor =` line. The planner's `flavourFromName` maps the raw name (case-insensitive) and flags unknown ones
  (e.g. Cura `Griffin`) as `flavourAssumed`.
- Goldens: unchanged (the golden summary does not include the new field; no `golden:update` needed).

Verified:
- gcode-api: `pnpm install && pnpm lint && pnpm test && pnpm build`: pass, 13 tests.
- gcode-parser: `pnpm install && pnpm lint && pnpm test && pnpm build`: pass, 337 tests (2 new in `test/tags.test.ts`:
  `;FLAVOR:Klipper` -> `Klipper`, Griffin, marlin2, header then config -> config, option does not change it, empty and
  none -> undefined; the name carries into later chunks). Lockfiles unchanged.
- gcode-parser also typechecked (`tsc -p`, src and tests) against the new gcode-api source via a scratch `paths` override: OK.

Release (coordinator):
1. Release gcode-api first (optional field added: minor). CHANGELOG: "- Added: `flavourName` on `Chunk` and `ParsedFile`:
   the flavour name the file states (`;FLAVOR:`, `; gcode_flavor =`), to pass to gcode-planner's `resolveLimits`."
2. Then gcode-parser (works with 0.5.0 or the new gcode-api; if gcode-api becomes 0.6.0, raise the range to `^0.6.0` so
   the shortcut type can later be dropped). CHANGELOG: "- Added: the parser fills `flavourName` on chunks and `collect`'s
   `ParsedFile` with the last flavour name the file states (`;FLAVOR:` or `; gcode_flavor =`)."

Part B (pending, a later worker, gcode-preview application):
- After both releases, raise gcode-preview's `@vsslicer/gcode-parser` range (and `@vsslicer/gcode-api` if it declares it)
  to the new versions (coordinator).
- `vsslicer/modules/gcode-preview/src/application/load-preview.ts:50`: `resolveLimits({ flavour: parsed.flavourName,
  config: parsed.config })`.
- Test in gcode-preview's `load.test.ts`: a `;FLAVOR:Klipper` file with no config block gets the Klipper planner
  (`limits.flavour === 'klipper'`); a `;FLAVOR:Marlin` file (and the Cura fixture `cube-cylinder-4.10.0.gcode` if
  available there) gets `flavourAssumed: false`, `flavourName: 'Marlin'`. The test must fail before the one-line fix.
- gcode-preview CHANGELOG: "- Fixed: the planner follows the file's `;FLAVOR:` header; Cura files no longer show 'marlin assumed'."

Review (gcp89-review): PASS (part A). gcode-api lint, 13 tests, build ok; gcode-parser lint and build ok, 337 of 338 tests pass; the one failure (bgcode.test.ts 'decoded-text offset ... truncated file') is in the bgcode lane (bgcode-source.ts, edited concurrently by another worker), not this card. Checked: SlicerTags.flavour records the last non-empty name (the option does not change it), every chunk carries it via take(), collect keeps the last chunk's, the worker posts the whole chunk object (structured clone keeps the string), and the planner's flavourFromName maps klipper/reprapfirmware/marlin names case-insensitively and flags unknown ones. Card left in doing (part B pending).

Files changed (part A):
- vsslicer/modules/gcode-api/src/domain/parsed-file.ts
- vsslicer/modules/gcode-api/test/types.test.ts
- vsslicer/modules/gcode-parser/src/domain/slicer-tags.ts
- vsslicer/modules/gcode-parser/src/domain/chunk-writer.ts
- vsslicer/modules/gcode-parser/src/domain/parser.ts
- vsslicer/modules/gcode-parser/src/application/collect.ts
- vsslicer/modules/gcode-parser/test/tags.test.ts
