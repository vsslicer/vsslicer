---
id: 191
title: Read the PrusaSlicer 3.0 preset trees and variants behind the experimental flag
type: feature
priority: P1
effort: M
model: opus
story: US14
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [33]
created: 2026-10-26
---

Split from PRF-33 at SP9 start (rule 17: one Opus L over two readers would run over 15 minutes). PRF-33 now covers the bounded YAML reader and `vendor.yaml`; this card reads the `preset-*.yaml` trees with `variants`, pinned to `PrusaSlicer@30ef591`, off unless `experimental` is set.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/yaml/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [x] Golden counts at @30ef591: 288 filament, 13 print, 11 printer, 12 tool presets, read from `.reference/repos/PrusaSlicer/resources/presets/prusa-research-fff/PrusaResearch/` when present (tests skip with a reason when absent); committed fixtures are small hand-written files, not vendored data
- [x] `variants` nest with `condition`, `id` and `values` as upstream defines them; quote the lines in `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Preset/IO/PresetYamlDesc.hpp` and `PresetLoader.cpp` that define the keys, and match them
- [x] Without the flag the reader returns a diagnostic and no entities; tests tagged `pinned-30ef591`
- [x] **Bounds:** uses PRF-33's YAML reader limits; variant nesting at most 32 and total variants per file at most 10,000, each with a hostile test asserting counts, never time

## Progress

**sp9-prf-191 (2026-10-26):**

- New `src/adapters/yaml/preset.ts`: `readPresetYaml(input, file, { experimental })` returns `{ presets: PresetYamlRoot[], diagnostics }`, each root `{ kind, id, name?, condition?, matchMode?, inherits, unconditionalInherits, values?, features?, variants: PresetYamlNode[], line }` with variants nested recursively; `values`/`features` stay verbatim `YamlMap`s, `condition` stays raw text (no condition-language mapping, no flattening). `readPresetStream(stream, ...)` is the same over a parsed stream, exported so the variant bounds are testable past `MAX_YAML_DEPTH`. Follows `readVendorYaml`: flag off gives one `experimental-off` diagnostic and no presets; bad documents (no kind, unknown kind, root without id, non-list `inherits`, non-map `values`/`features`/variant, unknown `match_mode`) are `bad-record` warnings and skipped or ignored, never thrown.
- Upstream at PrusaSlicer@30ef591 (AGPL-3.0, read only), matched:
  - `PresetYamlDesc.hpp:7-16` `ENUM_DESC(PresetKind, ("printer", FdmPrinter), ("print", FdmPrint), ("tool_print", FdmToolPrint), ("filament", FdmMaterial), ("sla_printer"...), ("sla_print"...), ("sla_tool_print"...), ("sla_material"...))`: the accepted `kind` strings.
  - `PresetYamlDesc.hpp:18-21` `("first_match", FirstMatch), ("all_matches", AllMatches)`: `match_mode`.
  - `PresetYamlDesc.hpp:23-33` `PRESET_VARIANT_FIELDS`: `FIELD_DESC_SIMPLE(condition)`, `FIELD_DESC(id, FIELD_DEFAULT, {}, ...)`, `FIELD_DESC_SIMPLE(name)`, `FIELD_DESC(inherits, ...)`, `FIELD_DESC(unconditional_inherits, ...)`, `FIELD_DESC(values, ...)`, `FIELD_DESC(features, ...)`, `FIELD_DESC_SIMPLE(match_mode)`, `FIELD_DESC(variants, ...)`; `:35-42` `STRUCT_DESC(PresetNode, PRESET_VARIANT_FIELDS)` and `STRUCT_DESC(RootPresetNode, FIELD_DESC_SIMPLE(kind), PRESET_VARIANT_FIELDS)`: `kind` only on roots, every other key on roots and variants alike, and `variants` recurse into `PresetNode`.
  - `slic3r-domain/include/Slic3r/Domain/Preset/PresetTree.hpp:27-42` `struct PresetNode { std::string id; std::optional<std::string> name; std::vector<std::string> inherits; ... std::optional<ParsedExpr> condition; std::optional<ConditionMatchMode> match_mode; PresetValueMap values; FeatureValueMap features; std::vector<PresetNode> variants; ...}`: id defaults to `''`, inherits are string lists.
  - `PresetLoader.cpp:54-63` `parse_all_documents_in_file(... parse_struct_unwrap<RootPresetNode>(doc) ... m_presets[preset.kind].emplace_back(...))`: one root per `---` document, appended in order; `:28-30` `for (const auto& v : node.variants) collect_names(...)` recurses variants; `:82` `load_dir` reads `*.yaml` except `vendor.yaml`.
- Bounds: PRF-33's parser limits apply (input goes through `parseYaml`); `MAX_PRESET_VARIANT_DEPTH = 32` (deeper variants dropped, one `too-deep`), `MAX_PRESET_VARIANTS = 10_000` per file across roots (rest dropped, one new `too-many-variants` reason added to `YamlReason` in `parse.ts`). Hostile tests assert counts: 500-level synthetic stream stops at depth 32 with one diagnostic; 40 levels in text hit the YAML depth limit as one diagnostic; 3 x 6,000 variants give 6,000 / 4,000 / 0 and one diagnostic.
- Fixture `test/fixtures/yaml/preset-print.yaml`, hand-written (PROVENANCE.md updated); added to the module's `.prettierignore` because prettier re-indents the compact `- key:` sequences the fixture exists to test.
- Golden (`pinned-30ef591`, skipped when the clone is absent): 288 filament, 13 print, 11 printer, 12 tool files; every file reads with zero diagnostics; roots by kind filament 442, print 29, printer 21, tool_print 17 (matches `grep -c '^kind:'`); 9,789 variants in total, deepest nesting 6.
- Verified: `pnpm test` 172 passed (7 new in `test/adapters/yaml-preset.test.ts`), `pnpm lint`, `pnpm build` clean; `node scripts/run.mjs checks` reports only 13 spdx-header problems, all in `modules/profile-catalogue-data` (not this card).
- Shared-file lines for the coordinator: CHANGELOG `- Read PrusaSlicer 3.0 preset-*.yaml trees with nested variants behind the experimental flag (PRF-191).` If `src/index.ts` should re-export it: `export { MAX_PRESET_VARIANT_DEPTH, MAX_PRESET_VARIANTS, readPresetStream, readPresetYaml } from './adapters/yaml/index.ts';` plus the `Preset*` types (the adapter barrel `src/adapters/yaml/index.ts` already exports them).
- Not done: unknown keys inside a node are not diagnosed (upstream behaviour for them not checked); no mapping to profile-api entities, no condition parsing, no inherits resolution or flattening.

**Review passed (sp9-rev-prf-191)** (2026-10-26)

- Ran: `pnpm test` 172 passed, 0 skipped (golden ran against the clone); `pnpm lint` clean (eslint, prettier, tsc); `pnpm build` clean; `node scripts/run.mjs checks` exit 0, all checks passed (the profile-catalogue-data spdx problems the builder saw no longer show).
- Upstream at `.reference/repos/PrusaSlicer` HEAD 30ef591: every quoted line checked and correct. `PresetYamlDesc.hpp:7-16` gives the 8 kinds, `:18-21` the two match_mode values, `:23-33` the fields (plus `source_location`, `FIELD_NAME_SELF`, so not a YAML key), `:35-42` puts `kind` on the root only and makes `variants` recurse into `PresetNode`. `PresetTree.hpp:27-42` has the struct as quoted. `PresetLoader.cpp:54-63` has one `parse_struct_unwrap<RootPresetNode>` per document; `:28-30` recurses variants; `:82` skips `vendor.yaml`. The reader matches all of it.
- Unknown keys: `Yaml.hpp` (`FieldTypeListHelper::parse_fields`, `:656-683`) looks up each declared field by name with `mapping_value_at` and never walks the map's keys, so upstream ignores unknown keys silently, including `kind` on a variant. The reader does the same (probed: `foo:` on a root and `kind:`/`bar:` on a variant give no diagnostic and are dropped). Upstream throws on a bad document (`parse_struct_unwrap`, `:901-908`; a missing `kind` fails as a required field, `:624`). The reader warns and skips instead, which is the intended tolerant difference.
- Golden counts confirmed from the pinned tree on my own (`ls`/`grep`): 288 filament, 13 print, 11 printer, 12 tool files; `^kind:` gives filament 442, print 29, printer 21, tool_print 17. The most variants in one file is 168 (`preset-filament-common-PET.yaml`), well under 10,000.
- Bounds probed through `src/` by absolute path: 10,000 flat variants are all read with no diagnostic, 10,001 give 10,000 and one `too-many-variants`; synthetic nesting of 32 gives depth 32 and no diagnostic, while 33 and 100,000 give depth 32 and one `too-deep`. The work is linear: 20k/200k scalar variants take 6/39 ms, 100k/400k-key `values` maps 37/244 ms, 50k roots 95 ms. `yamlGet` scans each map's own entries a fixed 9 times, so the total stays O(nodes).
- Mutations, run in a `mktemp -d` copy: depth limit +1, count limit +1, `capped` never set, `matchMode` dropped, flag check removed, depth not incremented. Each one fails a test in `yaml-preset.test.ts`.
- `.prettierignore` line: acceptable. It is the module's own file, it names one fixture, and its comment says why. Prettier really does rewrite the fixture (it re-quotes `'*base*'` and re-indents the compact `- key:` sequences, which I checked by formatting a copy). `# prettier-ignore` would cover only one node, so a whole-file ignore is the right tool.
- Note, not a defect: the reader's own warnings are not capped at `MAX_YAML_DIAGNOSTICS` (200k scalar variants give 200k `bad-record` diagnostics). They stay linear and are bounded by the parser's 1M-node limit, and `readVendorYaml` behaves the same way. A possible follow-up is to cap both readers' diagnostics.
- No in-place fixes made.
