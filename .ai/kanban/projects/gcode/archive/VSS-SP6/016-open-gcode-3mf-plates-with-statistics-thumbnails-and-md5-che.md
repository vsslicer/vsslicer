---
id: 16
title: "Open .gcode.3mf plates with statistics, thumbnails and MD5 check"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [15, 8]
created: 2026-10-25
---

Plate selection and the BBL metadata.

## Acceptance criteria

- [x] Bambu Studio and Orca BBL files open by plate N with `slice_info.config` statistics and `plate_N.png`
- [x] An MD5 mismatch against `plate_N.gcode.md5` raises a diagnostic (test with a doctored file)
- [x] The H2C fixture opens (Bambu Studio version recorded)

## Tasks

- [x] Plate enumeration
- [x] slice_info.config reader
- [x] MD5 check
- [x] H2C fixture test

## Progress

Done. New `src/adapters/gcode-3mf-plate.ts` (gcode3mf-source.ts untouched): `gcode3mfPlates(archive)` lists `Metadata/plate_N.gcode` numbers; `readGcode3mfPlate(archive, n)` returns slicer version (`X-BBL-Client-Version`), `PlateStatistics` from `slice_info.config` (prediction, weight, printer model, nozzles, filaments, objects, raw metadata), the `plate_N.png` bytes, and a `gcode-3mf-md5` error diagnostic when the inflated G-code's MD5 differs from `plate_N.gcode.md5`. Missing md5/png/slice_info leave the field undefined; absent plate throws. slice_info is read with a single-pass, quote-aware tag scanner (no regex over tags, no new dependency, no lockfile change); documented `shortcut:` in code.

Verified: `pnpm lint && pnpm build && pnpm test` pass (353 tests). `test/gcode-3mf-plate.test.ts` uses the owner's H2C fixture (`test/fixtures/bambu-studio/h2c-cube.gcode.3mf`, Bambu Studio 02.08.02.61 per PROVENANCE.md): stats, PNG magic, parse of the plate, a doctored file (via `writeZip`) giving the diagnostic, tolerance of missing parts, and a synthetic multi-plate slice_info. No Orca-produced .gcode.3mf exists in the repo or .reference, so the Orca half of criterion 1 is covered only by the identical BBL format and the synthetic test.

Not done: the MD5 diagnostic is not yet wired into `parse()`'s diagnostics stream (callers merge `readGcode3mfPlate().diagnostics`); plate inflated twice (MD5 and source).

Changelog: Added `gcode3mfPlates` and `readGcode3mfPlate`: plate enumeration, `slice_info.config` statistics, plate thumbnail and `plate_N.gcode.md5` check for `.gcode.3mf`.
- Review failed (gcp16-reviewer): lint/build/test green (353 tests); H2C fixture values, doctored-MD5 test, element names (header_item, plate, metadata, object, filament per bbs_3mf.cpp) and MD5 format (Bambu writes UPPERCASE hex, no newline; code trims+lowercases, OK) verified. FAIL: src/adapters/gcode-3mf-plate.ts:70 `/<plate\b[^>]*>([\s\S]*?)<\/plate>/g` is quadratic on unclosed tags: a 700 KB slice_info.config of 100000 '<plate>' takes 12.6 s in readGcode3mfPlate (probe in scratch rv16/p.mjs), a crafted file freezes the extension host. Fix: scan with indexOf('</plate>') and stop at the first unclosed plate (or cap the config size). Minor: `>` inside an attribute value (object name="a>b") yields name '' because of [^>]*. Double inflate of the gcode entry noted as the known follow-up, not a defect.
- Review fix (gcp16-fix): plate scan is now a linear indexOf loop that stops at the first unclosed `<plate>`; attributes read via a quote-aware pattern so `name="a>b"` works; `slice_info.config` over 4 MiB is skipped with a `gcode-3mf-slice-info-size` error diagnostic. Test added (100000 unclosed plates under 200 ms, `a>b`, size cap); lint/build/test green (354 tests). Changed: src/adapters/gcode-3mf-plate.ts, test/gcode-3mf-plate.test.ts.

- Review failed (gcp16-rereview): src/adapters/gcode-3mf-plate.ts ATTRS matchAll for <object>/<filament>/<metadata>/<header_item> is quadratic when tags lack a closing ">". Probe /private/tmp/claude-501/sp6.Xpe4yW/rr16/q.mjs: body of repeated `<object name=` (no >) takes 424 ms at 64 KiB, 1.7 s at 128 KiB, 6.8 s at 256 KiB; extrapolates to ~30 min at the 4 MiB cap (the 4 MiB cap does not bound it; DoS on a hostile slice_info.config). Plate scan, quoted ">" and the over-cap diagnostic are fine (first probe cases all <50 ms). Fix: cap tag length, or scan tags with indexOf(">") linearly, or lower the cap far enough.
- Review fix 2 (gcp16-fix2): all regex tag/attribute matching replaced by one linear generator `tags(xml)`: indexOf('<'), read name, walk attributes char by char (quotes skipped with indexOf of the matching quote) to the closing '>'; an unterminated tag or quote ends the scan. `readSliceInfo` consumes the tag stream (header_item anywhere; metadata/filament/object only inside an open <plate>; a nested <plate> joins the open one; </plate> finalizes). 4 MiB cap kept. Tests: 12 new cases (unclosed `<object name=`, unclosed quotes, 100000 unclosed `<plate>`, nested tags, each at 64 KiB, 1 MiB, ~4 MiB) each under 500 ms; H2C fixture test unchanged and green. Reviewer probes rr16/q.mjs (8 ms at 256 KiB) and p.mjs (all cases <=140 ms at 3.9 MiB, `a>b` still read). lint/build/test green (366 tests). Changed: src/adapters/gcode-3mf-plate.ts, test/gcode-3mf-plate.test.ts.
- Review passed (gcp16-rereview2): lint/build/test green (366 tests, H2C fixture ok); q.mjs and p.mjs max 141 ms; 60 s fuzz of 2679 random inputs up to 3.5 MB: worst 116 ms, no throws.
