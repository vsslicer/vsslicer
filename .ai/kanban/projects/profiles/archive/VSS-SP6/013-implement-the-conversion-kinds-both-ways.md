---
id: 13
title: Implement the conversion kinds both ways
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [12]
created: 2026-10-25
---

Pure functions that convert one value between a native dialect and the unified form: scale, sign flip, percent-of, enum map, 90-x.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/conversion/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] Each conversion kind round-trips a table of values (`native -> unified -> native` equals the input)
- [x] A lossy conversion returns a `lossy` flag with the reason; a `%` value stays relative (`50%` is not turned into a number)
- [x] An unknown enum value returns a diagnostic, not a guess

## Tasks

- [x] Write the conversion functions
- [x] Write the round-trip tests

## Progress

Done. `fromNative(conv, native)` (native -> unified) and `toNative(conv, unified, {resolve, base})` in `conversion/convert.ts`, for identity, scale, sign_flip, percent_of, enum_map, split (list and surface map). Typed `ConversionError` codes: not_a_number, zero_factor, unmapped_enum_value, percent_base_missing, split_mismatch. A `%` value stays `"N%"` both ways; only `toNative` with `resolve: true` turns it into a number (needs `base`, else error; result flagged lossy). enum_map is flagged lossy when several natives share one unified value and the input is not the canonical one. Scale results are rounded to 12 significant digits to kill float noise. Verified: `pnpm lint && build && test` pass (227 tests), fast-check round trips for scale/sign_flip/identity. Not done: dialect/key-level lookup (callers pass the NativeKey conversion); split conversions take/return records, not catalogue-aware key lists.

Changelog: PRF-13: `fromNative`/`toNative` convert a value per conversion kind (identity, scale, sign flip, percent-of, enum map, split) as exact inverses, with `lossy` reasons and a typed `ConversionError`.

Review passed (prf13-gcp109-reviewer): lint/build/test green (248 tests); every kind checked against entry.ts contract (scale 90-x, 0.01 flow, sign_flip, percent_of, enum_map reverse, split list/map); typed errors and unmapped enum probes OK. Non-blocking: 90-x round trip is not bit-exact for every 3-decimal value (0.007 -> 0.00700000000001, 1 in 90001 swept; 12-digit tidy after cancellation); real angles unaffected. `.5%` is rejected as not_a_number (regex needs a leading digit).
