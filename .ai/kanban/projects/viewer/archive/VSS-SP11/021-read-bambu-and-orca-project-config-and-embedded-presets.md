---
id: 21
title: Read Bambu and Orca project config and embedded presets
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [20]
created: 2026-10-25
---

Ports the key tables and config-part reading: `project_settings.config` JSON and `*_settings_N.config` presets returned as raw blobs for E12.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` and `BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Raw project config and every embedded preset blob are returned and match the fixture byte for byte
- [x] The printable area (bed shape) is exposed on the Project when present
- [x] Each ported file keeps the upstream notice and a `Ported from <repo>@<commit>:<path>` line (checked by `tools/check-licence`)

## Tasks

- [x] Port key tables
- [x] Read config parts
- [x] Notice and provenance lines
- [x] Tests

## Progress

Not started.

**Dependency on VWR-10 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-10.

**sp11-vwr-21 (2026-10-26):** done.

- `src/adapters/bambu/readBambu.ts` (new): `createBambuReader(readCore, 'bambu'|'orca')`. Key table ported from
  OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:230, :246-249 (`Metadata/project_settings.config`,
  `Metadata/{print_setting,process_settings,filament_settings,machine_settings}_`), dispatch :2042-2081 (case-insensitive
  equals/starts-with), checked against BambuStudio@79df7ae:...bbs_3mf.cpp:171, :186-189, :2110-2125. Those parts go to
  `rawConfig` byte for byte (not parsed, for E12) and out of `preserved`; other non-model parts are preserved.
  `printable_area` parsed per OrcaSlicer@09aa0114:src/libslic3r/Config.hpp:1619-1645 (split `,` then `x`, reject `|`,
  `;`, `..`) and Config.cpp:894-921 (JSON string list joins with `,`). AGPL-3.0 notice + `Ported from` line in the file.
  Difference from upstream: a garbled coordinate refuses the area (notice) instead of reading 0.
- `src/domain/project/project.ts`: optional `Project.printableArea?: readonly (readonly [x, y])[]`.
- Bounds (rule 25): project config parsed only up to 16 MiB (`MAX_CONFIG_BYTES`), area at most 4096 points
  (`MAX_AREA_POINTS`, `split` with a limit), one linear regex; part count/size already capped by openPackage.
  Bad JSON or a bad area: raw bytes kept, area absent, a notice; never throws, so no fallback to core.
- Tests: `test/readBambu.test.ts` (21): synthetic zip via openPackage for bambu, orca-via-tag and OrcaSlicer- files
  (rawConfig byte equality for project config + 4 preset kinds, area, preserved disjoint, objects), case-insensitive
  names, no key, bad JSON, oversized config, bad area, parsePrintableArea refusals and cap; plus real
  `.reference/.../OrcaBadge.3mf` raw config byte for byte vs fflate unzip (skipIf absent; ran locally).
- Mutation probes (each restored, each failed tests): drop machine prefix (4 fail), case-sensitive prefix (1),
  case-sensitive project name (1), size cap off (1), exclusion syntax off (3), point cap off (1), arity check off (1),
  empty-coord check off (2), finite -> NaN-only (1), join sep `;` (6), config parts not excluded from preserved (3),
  dialect not set (5), JSON notice off (1), area notice off (1), area not exposed (3), raw bytes altered (5).
- Verified (macOS; CI gate runs on ubuntu-latest): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok,
  `pnpm test` 16 files / 243 tests passed, `node scripts/run.mjs checks` exit 0 (check-licence included).

Release lines:

- `src/readProject.ts` wiring (add import and the `readers` entry):
  `import { createBambuReader } from './adapters/bambu/readBambu.ts';`
  `readers: new Map([['bambu', createBambuReader(readCore, 'bambu')], ['orca', createBambuReader(readCore, 'orca')]]),`
  (merge into one `readers` Map with the prusa/cura entries). Also drop "No dialect reader is registered yet." from its doc.
- CHANGELOG: `- Bambu Studio and OrcaSlicer projects: the project config and every embedded preset are returned raw in \`rawConfig\`, and the bed shape (\`printable_area\`) as \`Project.printableArea\` (VWR-21).`
- `src/index.ts`: none required (`Project` type already exported carries the new field).

**Review passed (sp11-rev-vwr-21)** (2026-10-26)

- Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc), `pnpm build` ok, `pnpm test`
  17 files / 268 tests passed (count includes sibling SP11 cards in the same module; `readBambu.test.ts` 21/21, the real
  `OrcaBadge.3mf` test ran, not skipped). One earlier full run failed while sibling cards' files were being written; two
  reruns passed clean. `node scripts/run.mjs checks` exit 0.
- Upstream: quoted lines checked in `.reference/repos` (OrcaSlicer@09aa0114 bbs_3mf.cpp:230, :246-249, :2042-2081;
  Config.hpp:1619-1645; Config.cpp:894-921; BambuStudio@79df7ae bbs_3mf.cpp:171, :186-189, :2110-2125): names,
  iequals/istarts_with, exclusion-syntax rejection and `,` join all match. The refuse-instead-of-0 difference is marked.
- Mutation probes (in a scratch copy, 15, all caught by `readBambu.test.ts`): machine prefix dropped (4 fail),
  case-sensitive names (1), size cap off (1), exclusion regex off (3), point cap off (1), arity check off (1), empty
  coordinate check off (2), list join on space (5), config parts left in preserved (3), area not exposed (3), raw bytes
  altered (4), JSON notice off (1), area notice off (1), dialect not set (4), finite check -> NaN only (1).
  check-licence probe: removing the `Copyright` line next to `Ported from` fails `ported-copyright`; dropping SPDX fails.
- Hostile probes (rule 25) on `parsePrintableArea` / the reader: 10M commas and a 1M-item list stop at the point cap;
  10M dots hit the exclusion check; 16M-char coordinate refused (Infinity); `null`, `[1]`, `"x"`, `__proto__` and a null
  area never throw. Regex is linear. No wall-time asserts in the tests.
- Layering: adapter imports only application/domain types; `Project.printableArea` is a pure domain field; no
  cross-module relative imports.
- Advisory (not blocking, bounded by `MAX_CONFIG_BYTES`): `readBambu.ts` `not XxY` notice echoes the whole bad item, so
  an 8 MB garbage `printable_area` yields an 8 MB notice string. Consider truncating the quoted item (e.g. 64 chars).
- For the coordinator: wiring into `src/readProject.ts` and the CHANGELOG line are still the release lines above; not
  applied by this card.
