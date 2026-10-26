# Provenance: conditions

Oracle fixtures for `test/adapters/conditions-oracle.test.ts` (PRF-11). Licence: the condition strings are short
excerpts of AGPL-3.0 upstream data; the printer fixtures, expectations and reasons are written for this
repository, AGPL-3.0-or-later.

## Sources

- `cases.json` `conditions`, keys `ini:<line>`: `compatible_printers_condition` values copied verbatim from
  `resources/profiles/PrusaResearch.ini` of PrusaSlicer@b028299c770b8380ee81c921a2867d522f288123 (tag
  `version_2.9.6`, AGPL-3.0); the number is the line of the first occurrence. 45 distinct conditions out of the
  350 distinct values (815 lines) in that file. The file has no `compatible_prints_condition` value and no `or`/`||`,
  so those come from the 3.0 presets below.
- Keys `yaml:<preset>:<line>`: `condition:` values from PrusaSlicer@30ef591 (3.0.0-alpha12, AGPL-3.0),
  `resources/presets/prusa-research-fff/PrusaResearch/preset-filament-<preset>.yaml:<line>`, or `vendor.yaml:<line>`
  for `yaml:vendor:*` (feeder conditions; the YAML `#` comment is stripped, as a YAML parser does).
- Keys `table:*`: rows of the condition table in `docs/research/profiles.md` section 6 (from the table, not a
  pinned sample).
- `printers.json` `prusa29`: hand-written printer presets; `printer_model` and the `printer_notes` keyword set are
  those of the cited `PrusaResearch.ini` lines (`src`: model line, notes line), the notes prose is shortened.
  `prusa30`: hand-written hardware selections with `printer.base_model`, `tool.*` and `feeder.*` as in
  `vendor.yaml:682-713` at PrusaSlicer@30ef591; `XL_HF04` and `MK4S_04` have no feeder (how 3.0 resolves `feeder.*`
  without one is not modelled, so no case evaluates `feeder.*` on them).

## Native rules used for the hand-computed `want`

All from PrusaSlicer@b028299:

- R1 `is_compatible_with_printer` evaluates `compatible_printers_condition` against the printer config plus
  `num_extruders` = length of `nozzle_diameter` (`src/libslic3r/Preset.cpp:390-421`).
- R2 `=~` / `!~` is `boost::regex_match`: the whole subject must match, `!~` negates
  (`src/libslic3r/PlaceholderParser.cpp:80-83,670-690`). Boost's default syntax lets `.` and `[^\.]` match the
  newlines in `printer_notes`, so `.*KEY.*` means "notes contain KEY".
- R3 `nozzle_diameter[0]`, `nozzle_high_flow[0]` index the first extruder's vector option; bare `nozzle_high_flow[0]`
  and `single_extruder_multi_material` are booleans; `!` is not, `and`/`or` evaluate both sides
  (`PlaceholderParser.cpp:735-746`).
- R4 3.0 YAML conditions use the same grammar over `printer.*`, `tool.*`, `feeder.*` (docs/research/profiles.md
  section 1, PrusaSlicer@30ef591; unverified beyond that commit).

Each case's `why` names the deciding clause.

## Lossy conversions

`convertPrusaCondition` flags 28 of the 57 conditions lossy, all for `printer_notes` regexes that are a partial
keyword or expand to several tags (`.*PRINTER_MODEL_MK2.*` -> MK2 or MK2.5, `.*MK4IS.*`, `.*XL.*`, `.*MK3.5.*`,
`.*COREONE.*`, `MK2[^\.]`, ...). Every such case still matches its hand-computed value except one, kept with
`knownLossy` (the test asserts it still differs and is flagged lossy):

- `ini:1459` on `MK35_025`: Prusa says false because the MK3.5 notes (`PrusaResearch.ini:41869`) lack
  `PRINTER_VENDOR_PRUSA3D`; the unified form tests `printer.vendor == 'PrusaResearch'`, true for a PrusaResearch
  printer, and `.*PRINTER_MODEL_MK3.*` widens to the MK3.5 tag. The vendor rewrite alone is reported exact by the
  converter although MK3.5 and MK4IS notes (`:41869`, `:40968`) lack the keyword.
