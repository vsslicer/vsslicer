---
id: 43
title: Write the gcode language contribution and TextMate grammar
type: feature
priority: P0
effort: M
model: sonnet
area: [language]
story: US15
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [4]
created: 2026-10-25
---

Highlighting for `*.gcode`, `*.g`, `*.gco`, `*.nc` including Klipper extended commands and the `[var]`, `{expr}` placeholders (highlighting only; the catalogue is E50). Needs the PLT extension packaging.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] Grammar snapshot tests (vscode-tmgrammar-test) over corpus excerpts from each slicer and hand-written Klipper and RRF macros; a retokenisation fails
- [x] Large-file mode turns tokenisation off past 20 MB; grammar tokenises a 20 MB file within a recorded time

## Tasks

- [x] Language configuration
- [x] Grammar
- [x] Snapshot tests
- [x] Performance measurement

## Progress

Done (gcp43-worker, new module `vsslicer/modules/gcode-language`, package `@vsslicer/gcode-language` 0.1.0, AGPL-3.0-or-later). A declarative extension: `contributes` only, no `main`, no activation, no code in `src/` (empty layer dirs; later E6 cards fill them).
- Language `gcode` for `.gcode .g .gco .nc` with `language-configuration.json`; grammar `syntaxes/gcode.tmLanguage.json` (`source.gcode`): G/M/T codes, parameters and bare flags, N line numbers, checksums, `;` and `( )` comments, M117/M118 text, strings, Klipper extended commands with `KEY=value`, RRF meta keywords (`if elif else while var set echo abort ...`), `[var]` and `{expr}` placeholders (nested). No custom editor.
- Snapshot tests (`vscode-tmgrammar-snap`, `pnpm test:grammar`): 7 fixtures in `test/fixtures/` (PrusaSlicer, Orca, Bambu Studio, Cura, SuperSlicer excerpts copied from the gcode-parser corpus, plus hand-written `klipper.cfg.gcode` and `rrf.cfg.gcode`; sources in `PROVENANCE.md`). Plus 3 `node --test` tests of the contribution (`test/contribution.test.ts`).
- Retokenisation fails: I renamed the T-code scope `entity.name.function.tool.gcode` to `entity.name.function.gcode` in the grammar; `pnpm test:grammar` failed (exit 255, diff at `T1`), then I restored the grammar and it passed.
- Large files: `configurationDefaults` `[gcode]` sets `editor.largeFileOptimizations: true` (VS Code then skips tokenisation above its 20 MB threshold) and `editor.maxTokenizationLineLength: 20000`. `pnpm bench` (`bench/tokenise.mjs`, vscode-textmate 9.3.2 + vscode-oniguruma 2.0.1): **20 MB, 885,040 lines, 5,603,260 tokens tokenised in 4.6-4.7 s** (two runs, Node 24, macOS).
- Verified in the module: `pnpm install` (lockfile written; unchanged on rerun), `pnpm lint`, `pnpm test` (3 node tests + 7 snapshots pass), `pnpm build` (tsc typecheck of tests/bench; nothing to bundle). `node scripts/run.mjs test --changed HEAD --list` lists `@vsslicer/gcode-language`. `.github/workflows/ci.yml` needs no edit.
- Not done: no `package` script (`vsslicer-package` expects `dist/*.js` bundles and `THIRD-PARTY-NOTICES.md`; a grammar-only VSIX needs tooling support). Empty dirs `src/{domain,application,adapters,presentation}` exist; remove if unwanted.
- CHANGELOG: I wrote the module's first entry (0.1.0, GCP-43) as a new module.
- Files created: everything under `vsslicer/modules/gcode-language/` (package.json, pnpm-lock.yaml, pnpm-workspace.yaml, .npmrc, .gitignore, .prettierignore, tsconfig.json, eslint.config.mjs, language-configuration.json, syntaxes/gcode.tmLanguage.json, bench/tokenise.mjs, test/contribution.test.ts, test/fixtures/*.gcode and *.snap, README.md, CHANGELOG.md, PROVENANCE.md, LICENSE).
- Review (gcp43-review): PASS, clean install/lint/test(3 node + 7 snapshots)/build all pass; sibling conventions match (AGPL, LICENSE, tooling dev dep, .npmrc); Klipper `{expr}`/`[var]` tokenised in snapshots; renamed T-scope in a scratch copy makes the snapshot diff fail; `run.mjs test --changed HEAD --list` includes @vsslicer/gcode-language; bench rerun 5.7 s (10.3 s once under load avg 58), within the same order as the recorded 4.6 s. Fixed in place (docs only): PROVENANCE.md claimed nothing was copied and omitted the fixtures' AGPL licence.
