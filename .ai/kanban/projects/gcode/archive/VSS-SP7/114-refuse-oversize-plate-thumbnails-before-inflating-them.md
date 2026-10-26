---
id: 114
title: Refuse oversize plate thumbnails before inflating them
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP7"
owner: sp7-gcp-114
created: 2026-10-26
---

From GCP-36's review: `readGcode3mfPlate` inflates each plate thumbnail fully (bounded only by 3mf's 512 MiB per-entry default) before the preview can check its size; a 407 KB file put a 300 MiB thumbnail in the extension host. The parser should refuse an oversize thumbnail from the zip directory, as GCP-112 does for `slice_info.config`.

**Code:** `vsslicer/modules/gcode-parser/src/adapters/gcode-3mf-plate.ts` and its tests (module: `gcode-parser`, layer: `adapters`)

## Acceptance criteria

- [x] Bounds (rule 25): a thumbnail whose declared uncompressed size is over 4 MiB (an exported `MAX_THUMBNAIL_BYTES`) is never inflated; the plate reads without it and a diagnostic names it
- [x] At most 16 thumbnails per plate are read; the rest are skipped with one diagnostic
- [x] Hostile tests: a 300 MiB declared PNG is never inflated (spy), and a plate listing 100 thumbnails reads 16

## Tasks

- [x] Cap, diagnostics, tests

## Progress

Done in `vsslicer/modules/gcode-parser/src/adapters/gcode-3mf-plate.ts` and `test/gcode-3mf-plate.test.ts`. Exported `MAX_THUMBNAIL_BYTES` (4 MiB): a `Metadata/*.png` of the plate (`_N` token in the name) declaring more is never inflated (diagnostic `gcode-3mf-thumbnail-size`). At most 16 thumbnails per plate are read, one `gcode-3mf-thumbnail-count` diagnostic for the rest. New field `Gcode3mfPlate.thumbnails: Map<name, bytes>`; `thumbnail` is still `plate_N.png`. Tests: 300 MiB declared PNG never inflated (spy); 100 thumbnails read 16. Verified: `pnpm test` 370 pass, eslint, tsc, prettier on my files, `pnpm build` ok. `pnpm lint` fails only on prettier --check of CHANGELOG.md (not mine). Not done: lying-small declared size throws CorruptZipError as for slice_info.

### Coordinator: shared-file changes
- `src/index.ts` / `src/gcode-3mf.ts` subpath: export `MAX_THUMBNAIL_BYTES` from `./adapters/gcode-3mf-plate.ts`.
- CHANGELOG: "gcode.3mf plate thumbnails over 4 MiB declared are not inflated; at most 16 per plate; new `thumbnails` field."

### Review (sp7-rev2-gcp): PASS
Ran in the module: `pnpm test` 370/370; eslint clean; `tsc --noEmit -p tsconfig.test.json` clean; `prettier --check src test` clean (`pnpm lint` fails only on prettier of the committed, unmodified CHANGELOG.md, not this card); `pnpm build` OK. Only `src/adapters/gcode-3mf-plate.ts` and its test changed. Checked: `e.size` is the central-directory declared uncompressed size (3mf `fflateZip.ts:74-103`), tested before `inflated()`; 3mf also refuses an entry inflating past its declared size, so a lying-small entry cannot exceed 4 MiB. Own probe: name pattern for plate 1 takes `plate_1.png`, `plate_1_small.png`, `plate_no_light_1.png`, `top_1.png`, `pick_1.png`, `1.png`, and does NOT take `plate_10.png`, `plate_11.png`, `plate_21.png`, `x1.png`, `plate_1.PNG`; exactly 4 MiB is read, 4 MiB + 1 is skipped with `gcode-3mf-thumbnail-size`; 16-of-100 cap and one count diagnostic confirmed. The 30 s timeout: building the fixture (`writeZip` deflating and CRC-ing 300 MiB of zeros) takes 5.2-6.4 s here; `readGcode3mfPlate` on it takes 7 ms. So the timeout is margin for fixture construction on slow CI, not reader cost; acceptable, though a 5 MiB entry (or a patched central-directory size) would test the same bound in under 100 ms.
Notes (not failures): a name with two plate tokens (`plate_2_1.png`) is listed for both plates; the 16-entry cap follows zip order, so a hostile archive can push `plate_N.png` past it (it could equally omit it); the size diagnostic embeds the entry name unclipped (zip names are at most 64 KiB, 16 diagnostics at most).
