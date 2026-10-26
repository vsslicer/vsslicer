---
id: 43
title: "Spike: confirm the flattened Prusa export is byte-equivalent on 10 presets"
type: spike
priority: P0
effort: S
model: opus
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [25, 135]
created: 2026-10-25
---

PrusaSlicer stores system presets flattened (`PresetBundle.cpp:1367`); this checks that exporting the flattened form reproduces the original bytes before the writer is built.

**Code:** `vsslicer/modules/profiles-prusa/docs/spikes/flatten-export.md` (module: `profiles-prusa`, layer: n/a (spike notes))

## Acceptance criteria

- [x] 10 Prusa presets compared: import, flatten, write; byte diff reported per preset with the cause of each difference
- [x] Decision on number formatting (`0.2` vs `0.20`) and key order rules for the writer

## Tasks

- [x] Pick 10 presets
- [x] Write and diff
- [x] Record the rules

## Progress

Not started.

### 2026-10-26 sp10-prf-43

Answer: **no, not byte-equivalent, and it cannot be** for vendor presets; **yes** for files PrusaSlicer writes. Notes:
`.reference/notes/PRF-43-flatten-export.md`; probes and output in `.reference/notes/PRF-43-probe/`. Source
PrusaSlicer-2.9@b028299c (AGPL-3.0, read only). No file in `vsslicer/modules/profiles-prusa` was changed (other agents
own it); the card's `docs/spikes/flatten-export.md` is left for the coordinator to copy from the notes.

- Serializer model (ported from Config.cpp/Config.hpp) is a fixed point on all lines of 4 real PrusaSlicer outputs
  (default_fff.ini 307/307, three test G-code config blocks 353/353 each); all four are byte-sorted.
- 10 presets (3 printers MK4S / MINI & MINI+ / XL 5T, 4 prints, 3 filaments): none byte-equal to PrusaSlicer's
  export model. Per preset: 41-132 lines equal; causes are type defaults PrusaSlicer adds (print 198, filament 86,
  printer 90 keys vs 42-132 flattened), dropped keys (`octoprint_*`, `serial_*`, `*_settings_id`, `renamed_from`,
  `external_fill_pattern` alias, `wipe_tower_x/y/rotation_angle`), and 0-2 re-serialized values each (`0.30`->`0.3`,
  `80`->`80%`, `150`->`150%`, `\"`->`"`). Against the vendor section text: inherits gone, source key order (9/10
  unsorted), values trimmed, empty values gain `key = `. Table in the notes.
- Whole bundle: 2 319 of 388 733 stored values (0.6 %) in 6 497 presets would be re-serialized: missing `%` 1 512,
  trailing zero 451, `coStrings` quoting 299, string escape 57; no precision loss, nothing unparsable.
- A real PrusaSlicer file (default_fff.ini) imported as print/filament/printer user preset and written back with
  header verbatim + sorted keys + verbatim values is byte-equal (311 keys, 0 diagnostics).

Decisions: keys byte-sorted always (`std::map` order, Config.cpp:1119-1126); lines `key = value`, empty `key = `;
untouched keys keep stored text (`0.20` stays); edited keys formatted as PrusaSlicer does: `%g` precision 6
(`0.2`, `1e+06`), `,` joins without space, `%` on percent types, `nil`, `0/1`, `coString` escapes only `\ \n \r`,
`coStrings` `;`-joined and quoted only when needed.

**PRF-52 must:** (1) redefine the vendor-preset criterion as idempotence (`import(export(import(x))).values` deep-equals
`import(x).values`, export bytes stable), since a vendor section cannot be rebuilt from its flattened form;
(2) keep the source header line and line ending in the native form (PrusaNative has neither today; the header has a
timestamp) or compare bodies only; (3) port `g()`/`canon()` from `PRF-43-probe/probe.mjs` for edited keys, with the
option type table from PrintConfig.cpp; (4) not add defaults in the native writer, and leave out non-type keys
(`*_settings_id`, `renamed_from`, `octoprint_*`) when writing from unified data, keeping them only on a verbatim
round trip. Unverified: bytes of 2.9-only defaults and Windows CRLF (no PrusaSlicer 2.9 install).

**Review passed (sp10-rev-prf-43)**

- Re-ran `probe.mjs` against the current `profiles-prusa` dist in a scratch copy: output identical to `out3.txt`
  (oracles 307/307 and 353/353 x3; 6 497 presets, 388 733 values, 2 319 re-serialized = 1 512 + 451 + 299 + 57).
  `probe-user.mjs`: byte-equal for print/filament/printer, 311 keys, 0 diagnostics.
- Checked every cited line in PrusaSlicer-2.9@b028299c (Config.cpp 54-149, 1037-1045, 1119-1126; Config.hpp 715-730,
  848-857, 1166-1176, 2952; Preset.cpp 295-359; PresetBundle.cpp 1367, 1609-1629, 2037-2056; PrintConfig.cpp 1124,
  5348-5353; utils.cpp 931-934; Time.cpp 25): each says what the notes claim.
- Mutation probes on the model: dropping `%` on percent types drops the oracle to 300/307 and 345/353; dropping
  `coStrings` escaping drops it to 306/307 and 352/353. Replacing `g()` with `String(v)` changes nothing: no oracle or
  bundle value exercises the exponent or 6-digit rounding path; only the probe's own asserts cover it (noted in the doc).
- Wrote `vsslicer/modules/profiles-prusa/docs/spikes/flatten-export.md` from the notes with sources and a licence
  note (docs only). Module: `pnpm lint` clean (after prettier on the new doc), `pnpm build` ok, `pnpm test` 236/236
  in 10 files; `node scripts/run.mjs checks` exit 0.
- Appended the four "PRF-52 must" items to PRF-52's acceptance criteria under "From PRF-43".

