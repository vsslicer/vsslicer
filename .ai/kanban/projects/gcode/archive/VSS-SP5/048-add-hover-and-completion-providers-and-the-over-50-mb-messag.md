---
id: 48
title: Add hover and completion providers and the over-50-MB message
type: feature
priority: P0
effort: M
model: sonnet
area: [language]
story: US16
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [46, 44]
created: 2026-10-25
---

Plain providers in the extension host, no language server. Slicer tag comments have hovers.

## Acceptance criteria

- [x] Every catalogued command has a hover and completion offers commands and parameters per flavour (`@vscode/test-electron` per flavour)
- [x] Unknown commands warn only when the flavour is known
- [x] A file over 50 MB opens in the preview and language features say why they are unavailable

## Tasks

- [x] Hover provider
- [x] Completion provider
- [x] Tag comment hovers
- [x] Large-file message
- [x] Integration tests

## Progress

Done (gcode-language). Hover (catalogued commands: description, parameters, flavours, source link; Bambu shows undocumented/unverified; 12 slicer tag comments such as `;LAYER_CHANGE`, `;TYPE:`), completion (commands, then unused parameters of the line's command, filtered by the status-bar flavour incl. override; all flavours when unknown), warning diagnostic for unknown G/M/T codes only when the flavour is known (extended commands such as Klipper macros never warn, since they are user-defined). Over 50 MB: VS Code itself never hands a text file above 50 MB to extensions ("Files above 50MB cannot be synchronized with extensions", found by the test), so the extension watches editor tabs, stats the file, shows a status-bar item "G-code features off" plus an information message with an "Open in preview" button (`vscode.openWith` gcode-preview's `vsslicer.gcode.preview.gcode`); the size gate also guards every provider.
Verified: `pnpm lint`, `pnpm test` (24 unit tests, 10 new in test/features.test.ts: lookup by flavour, unknown-command rule, size gate, hover for every catalogue entry x flavour, completion), `pnpm build`, `pnpm test:integration` (12 tests: marlin, klipper, reprapfirmware x hover/complete/warn, unknown flavour no warning, override, 51 MB file) pass on VS Code 1.100.0 (min) and stable 1.143.1, about 16 s wall (11 s of tests, 2 s per VS Code, rest build and start).
Not done / unverified: the "Open in preview" button is not clicked in the test (gcode-preview is not installed there); that gcode-preview opens a >50 MB file is not tested here. Findings for the catalogue owners: reprap.json repeats G1/M104 already in marlin.json (index keeps the entry naming fewer flavours); klipper lacks T0, so Klipper files with T0 warn; the catalogue is not complete for real files, so warnings may be noisy until entries grow.
CHANGELOG: - Added: hover, completion and unknown-command warnings from the catalogue, slicer tag hovers, and a message with "Open in preview" for files over 50 MB; activates on startup finished (to see large files VS Code does not give extensions).
Dependencies (done via pnpm install, lockfile changed): devDependencies `@vsslicer/test-vscode ^0.2.3`, `@types/mocha 10.0.10`; package.json `files` gains `catalogue`, script `test:integration`, activationEvents gains `onStartupFinished`.
Files: vsslicer/modules/gcode-language/{package.json, pnpm-lock.yaml, tsconfig.json, eslint.config.mjs, .prettierignore, src/domain/{lookup,tags,size}.ts, src/application/features.ts, src/presentation/{features,extension,status}.ts, test/features.test.ts, test/integration/language.test.ts}.
- Pulled back into SP5 from SP6 at 01:53 by the coordinator: the gcode-language lane ran ahead (GCP-43 to 46 done, GCP-47 in review).
- Review (gcode48-review): PASS, frozen install, lint, 24 unit tests, build and test:integration (12 on VS Code stable) rerun green; vscode imported only in src/presentation; every catalogue entry x flavour hovers (unit test over the loaded catalogue); completion and warnings filtered by flavour incl. override, no warning for unknown flavour; viewType vsslicer.gcode.preview.gcode exists in gcode-preview package.json; 51 MB file written only under os.tmpdir and removed in after(); pnpm pack ships catalogue/*.json and the catalogue loads from context.extensionPath. Activation: onStartupFinished is acceptable (sync load of ~70 KB JSON plus tab events); no cheaper trigger exists since onLanguage never fires for >50 MB files. Note: onLanguage:gcode is redundant next to onStartupFinished.
