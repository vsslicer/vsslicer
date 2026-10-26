---
id: 33
title: Read the PrusaSlicer 3.0 YAML tree behind the experimental flag
type: feature
priority: P1
effort: L
model: opus
area: [importers]
story: US14
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [119, 135, 10]
created: 2026-10-25
---

Reads `vendor.yaml` kinds through a bounded YAML reader, pinned to `PrusaSlicer@30ef591`; off unless `experimental` is set. Split at SP9 start (rule 17): the `preset-*.yaml` trees and variants are PRF-191, which uses this card's reader.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/yaml/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [x] A bounded reader for the YAML subset the pinned tree uses (block maps and sequences, flow `{}`/`[]`, plain, single- and double-quoted scalars, `#` comments), with no new dependency; anything outside the subset (anchors, aliases, tags, multi-document, merge keys) is a named diagnostic, never silently accepted. Quote the upstream reader it must agree with: `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Yaml/YamlAdapterRyml.cpp` and `YamlAdapter.hpp` (lines that define how scalars and maps are read), and `src/slic3r-shared/src/Slic3r/Biz/Preset/IO/HwConfigLoader.cpp` for the vendor keys
- [x] Golden counts at @30ef591 for `vendor.yaml`: 17 printers, 32 printer_configs, 10 tools, 3 feeders, 6 sheets, read from `.reference/repos/PrusaSlicer/resources/presets/prusa-research-fff/PrusaResearch/vendor.yaml` when present (skip with a reason when absent); committed fixtures are small hand-written files, not vendored data
- [x] Without the flag the reader returns a diagnostic and no entities; tests tagged `pinned-30ef591`
- [x] **Bounds:** input at most 8 MiB, nesting depth at most 64, at most 1,000,000 nodes, scalars at most 1 MiB, scanning linear in the input (no backtracking regex over input bytes); a hostile test for each (deep nesting, node flood, long scalar, unterminated quote, 1 MB of indentation) asserts the diagnostic and a node or step count, never time

## Tasks

- [x] Bounded YAML subset reader
- [x] Read vendor.yaml
- [x] Pin and tag the tests

## Progress

2026-10-26, sp9-prf-33 (Opus):

- `src/adapters/yaml/parse.ts`: `parseYaml(input, file)` returns a native `YamlStream` (`documents[]` of
  `YamlNode` = scalar | seq | map, `diagnostics`, `stats {nodes, steps}`), plus `yamlGet` / `yamlScalar` helpers
  for PRF-190. One forward pass over a typed-array line table, no regex over input bytes, no new dependency.
  Follows the INI reader's shape: native tree + profile-api `Diagnostic` (code `malformed-line`), no entities.
  Every diagnostic also carries a named `reason` (`YamlDiagnostic`), since `DiagnosticCode` is closed.
- Upstream agreement (PrusaSlicer@30ef591, read only, nothing ported): scalars stay strings, verbatim for plain,
  as `scalar_value` returns `val()` (`src/slic3r-shared/src/Slic3r/Biz/Yaml/YamlAdapterRyml.cpp:129-138`);
  key lookup returns the first child with that key, as `find_child` does (`YamlAdapterRyml.cpp:179-198`, so
  duplicates are kept and warned); a stream is iterated document by document (`YamlAdapterRyml.cpp:71-95`,
  node kinds Scalar/Sequence/Mapping from `YamlAdapter.hpp:7-10`).
- **Deviation from the criterion, on purpose:** the pinned `vendor.yaml` *is* a 69-document `---` stream (and
  the `preset-*.yaml` files use `|`, `|-`, `|+` block scalars 81 times), so `---` separators and literal block
  scalars are in the subset. Still refused with a named reason, document dropped, next document read: anchors,
  aliases, tags, merge keys, `?` keys, `%` directives, `...`, folded `>`, indentation indicators, multi-line
  flow/plain/quoted scalars, tabs in indentation, content on the `---` line.
- Bounds: 8 MiB input, depth 64, 1,000,000 nodes (fatal: parse stops), scalars 1 MiB, 1,000 diagnostics.
- `src/adapters/yaml/vendor.ts`: `readVendorYaml(input, file, { experimental })` groups documents by the
  `kind` discriminants `HwConfigLoader::load` dispatches on (`src/slic3r-shared/src/Slic3r/Biz/Preset/IO/HwConfigLoader.cpp:168-212`):
  vendor, printers, printerConfigs, tools, feeders, sheets, each `{kind, id, line, node}`. Unknown/missing kind,
  missing id and duplicate id (first kept; printer_configs are a list upstream so not deduplicated) are warned
  (reason `bad-record`). Without `experimental: true`: one `experimental-off` diagnostic and nothing read.
- `src/adapters/yaml/index.ts` barrel; fixture `test/fixtures/yaml/vendor.yaml` (hand-written) + PROVENANCE.md.
- `test/adapters/yaml.test.ts`: 34 tests: subset shapes, 14 refusals (one per reason), directive/`...`, bad
  document does not stop the next, hostile bounds (8 MiB, invalid UTF-8, 1000-deep block, 100k-deep flow,
  1M+ node flood, 1 MiB+ plain/quoted/literal scalar, unterminated quote, 1 MB of indentation, 300k blank lines
  in a literal, linear step ratio 10k vs 20k lines) asserting diagnostics and node/step counts only; vendor
  flag-off, fixture, bad records; `pinned-30ef591` tests (skip with a reason when the clone is absent):
  golden counts 17/32/10/3/6 and all 325 pinned `.yaml` files under `resources/presets` read with zero
  diagnostics.
- Verified: `pnpm test` 165/165 (6 files), `pnpm lint` clean, `pnpm build` clean. `node scripts/run.mjs checks`
  fails only on `modules/gcode-planner/test/fixtures/klipper-estimator: missing PROVENANCE.md` (not this card).
- Not done: mapping records to profile-api entities (later card), folded scalars and multi-line flow/quoted
  scalars (unused at @30ef591), `technology` grouping of records.
- Coordinator, shared-file lines: `src/index.ts`: `export * from './adapters/yaml/index.ts';`
  `CHANGELOG.md` (Unreleased, Added): `- Bounded YAML subset reader and \`readVendorYaml\` for the PrusaSlicer 3.0
  preset tree (experimental flag, pinned to PrusaSlicer@30ef591) (PRF-33).`

**Review failed (sp9-rev-prf-33)**, 2026-10-26:

- Ran: `pnpm test` 165/165 (6 files; yaml 34, pinned tests ran against the clone), `pnpm lint` clean, `pnpm build`
  clean, `node scripts/run.mjs checks` exit 0. Upstream clone at 30ef591.
- Golden counts confirmed independently by grep on the pinned `vendor.yaml`: 1 vendor, 17 printer, 32
  printer_config, 10 tool, 3 feeder, 6 sheet; 68 `---` lines = 69 documents.
- The `---` / literal-block departure is right: the pinned `vendor.yaml` is a 69-document stream and the
  pinned presets use `|` 19, `|-` 58, `|+` 4 times. Without them the reader could not read the tree.
- Differential check: every one of the 325 pinned `.yaml` files parses to exactly the same values as js-yaml 4.3.2
  with `FAILSAFE_SCHEMA` (all scalars kept as strings), `loadAll`: 0 mismatches. That covers the forms the pinned
  files use: `\n` (the only escape in them), `''` doubling (14 files), trailing spaces (180 lines), comments after
  values, empty values (13,857), and `|`/`|-`/`|+` chomping. js-yaml stands in for the spec here. I did not run
  ryml (not built), so agreement with ryml on the edge cases below is per the YAML 1.2 spec and unverified.
- Hostile probes (a script importing `src/` in a `mktemp -d` dir), all bounded and diagnosed: 5000-deep block and
  100k-deep `- - -` / `{a:` / `[` nesting stop at `too-deep` (≤190 nodes); 8 MiB of `- ` lines and of `-` lines and
  a 400k-pair flow map stop at `too-many-nodes` (1,000,001 nodes); an 8 MiB unterminated `"` stops at
  `scalar-too-long` after 1,048,582 steps; 2,097,151 bare `---` lines = 2,097,152 steps; 762,600 erroring documents
  are capped at 1,001 diagnostics, linear (100k/200k/400k docs = 0.6M/1.2M/2.4M steps). Step ratio is 4.086 for
  4x input in a mixed plain/quoted/flow/literal/compact document.
- Mutations in a copy of the module, each caught: depth cap off, node cap off, scalar cap off, `''` not undoubled,
  `|+` keep, clip as strip, comments not stripped, trailing blanks not trimmed, flag check off, `---` ignored,
  duplicate-key warning off. Not caught: see 3 below, and deduplicating `printer_config` (that rule has no test;
  minor, no fix required).

Problems (each is an accepted form returning a wrong value silently, or a test gap):

1. `src/adapters/yaml/parse.ts:446-459` (literal) with the line table at `:164-183`: with input ending in `\n`,
   the empty pseudo-line after the final newline is read as a blank content line. That gives `|+` one newline
   too many at end of input: `a: |+\n  x\n` returns `"x\n\n"` where the spec and js-yaml give `"x\n"`, and
   `a: |+\n  x\n\n` returns `"x\n\n\n"` where they give `"x\n\n"`. Expected fix: skip that last empty line
   (`n === count - 1` when the text ends in `\n`) or leave it out of the line table, plus a test for `|+` at
   end of input with and without a trailing newline.
2. `src/adapters/yaml/parse.ts:447,451`: inside a literal, a whitespace-only line with more spaces than the
   content indent becomes `''`, but the spaces past the indent are content. `a: |\n  x\n     \n  y\n` returns
   `"x\n\ny\n"` where the spec and js-yaml give `"x\n   \ny\n"`. Expected fix: when `ind >= 0` and the
   line's indent is greater than `ind`, keep `text.slice(lstart + ind, lend)`, and add a test.
3. `test/adapters/yaml.test.ts:194-200`: the linear-steps test uses only flow values, so it never runs
   `plainEnd` on a block plain scalar, the most common form. A mutation that makes `plainEnd` quadratic (adding
   steps for every preceding line on each call) passes all 34 tests. Expected fix: put a block plain scalar with
   a trailing comment, and a literal block, into the ratio document.

Note, no fix required: `Fail extends Error`, so each dropped document pays for a stack capture. 762k erroring
documents take about 3.5 s even though the step count stays linear. If that matters, a plain object or
`Error.stackTraceLimit = 0` around the parse would avoid it.

Fix (sp9-prf-33-fix), answering the FAIL above:

1. `src/adapters/yaml/parse.ts` `literal()`: the loop stops at the empty pseudo-line after a final `\n`
   (`n === count - 1 && lstart[n] === text.length`). `a: |+\n  x\n` now gives `"x\n"`, `a: |+\n  x\n\n` gives
   `"x\n\n"`, `a: |+\n  x` gives `"x\n"`. All three match js-yaml 5.5.0 (FAILSAFE_SCHEMA), checked in a scratch probe.
   js-yaml adds the final break even when the input has no trailing newline, so I matched it there.
2. Same function: a whitespace-only line keeps `text.slice(lstart + ind, lend)` when its indent is past the content
   indent. `a: |\n  x\n     \n  y\n` now gives `"x\n   \ny\n"`, same as js-yaml.
3. `test/adapters/yaml.test.ts` linear-steps test: each repeated unit now holds a flow line, a block plain scalar with
   a trailing comment (`p<i>: plain value # c`) and a two-line literal block. Checked: the mutation that makes
   `plainEnd` quadratic (`stats.steps += n` per call) now fails this test (1 failed, 33 passed). Reverted.
- Tests added in the literal test: the three `|+` end-of-input cases and the whitespace-only line case.
- Verified: `pnpm test` 165/165 pass (6 files), `pnpm lint` and `pnpm build` clean, `node scripts/run.mjs checks` passes.
- Not done: the optional stack-capture note. It is not a one-line change (`Fail` would have to stop extending `Error`,
  or the parse would need a `stackTraceLimit` save and restore), so I left it.

**Review passed (sp9-rerev-prf-33)**, 2026-10-26 (re-review of the fix above):

- Ran in the module: `pnpm test` 165/165 (6 files; yaml 34, pinned tests ran against the clone at 30ef591), `pnpm lint`
  clean, `pnpm build` clean. `node scripts/run.mjs checks` exits 1 on one problem outside this card:
  `modules/profile-catalogue-data/package.json: package-license` (check-licence); fixture and other checks pass.
- Differential check: all 325 pinned `.yaml` files under `resources/presets` parse to the same values as js-yaml 5.5.0
  (`FAILSAFE_SCHEMA`, `loadAll`, imported by absolute path from `vsslicer/modules/gcode-language/node_modules`):
  0 mismatches, 0 diagnostics. 13 edge probes (`|+` at end of input with 0/1/2 trailing newlines, whitespace-only
  lines past the content indent, `|-`/`|+` with trailing whitespace lines, literals in sequences and before `---`,
  a leading blank line in a literal, comments after values) agree with js-yaml, except one representation detail:
  an empty document after a final `---` gives `root: undefined` where js-yaml gives `""`. No fix required.
- The three earlier problems, each checked by mutation in a `mktemp -d` copy of the module (reverting the fix or
  adding `stats.steps += n` per call to make a scanner quadratic), each caught: end-of-input break removed (1 test
  fails), whitespace-only line back to `''` (1 fails), `plainEnd` quadratic (1 fails); also literal loop quadratic
  (2 fail) and flow plain item quadratic (1 fails). Problems 1, 2 and 3 are fixed.
- Hostile probes on the changed literal code: 1,500 lines of 5,000 spaces inside a literal and 2,000,000 blank lines
  in a `|+` stop at `scalar-too-long` with steps linear in the input (8.6M steps for 7.5M chars, 3.0M for 2.0M);
  200,000 literals read clean in 2.7M steps for 2.9M chars.
- Rest of the card unchanged since the first review (vendor.ts, bounds, flag-off, golden counts 17/32/10/3/6); its
  tests pass. The `printer_config` no-dedup rule still has no test (minor, as noted before).
- Nothing fixed in place.
