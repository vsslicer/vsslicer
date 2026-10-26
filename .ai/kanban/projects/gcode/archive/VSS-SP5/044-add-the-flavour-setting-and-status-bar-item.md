---
id: 44
title: Add the flavour setting and status-bar item
type: feature
priority: P0
effort: S
model: sonnet
area: [language]
story: US15
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [43]
created: 2026-10-25
---

Flavour from E3 header detection, overridable.

## Acceptance criteria

- [x] Detected flavour appears in the status bar; unknown shows 'generic' (test)
- [x] A setting overrides it per file

## Tasks

- [x] Reuse E3 detection (see Progress: shortcut)
- [x] Setting
- [x] Status item

## Progress

Done. Module vsslicer/modules/gcode-language.

- Domain `src/domain/flavour.ts`: `detectFlavour(head)` (`;FLAVOR:` / `; gcode_flavor =`, last wins, name as written), `flavourLabel(detected, override)` ('generic' when both absent), `HEAD_BYTES` = 64 KiB. gcode-parser 0.10.1 exports nothing for header/flavour detection (only parse/readSummary/types), so this is the minimal duplicate, marked `shortcut: duplicates gcode-parser's SlicerTags flavour read, switch to gcode-parser's export once it has one` (switch to `ParsedFile.flavourName` after the next gcode-parser release).
- Presentation `src/presentation/status.ts` (`registerFlavourStatus(context, host)`, vscode type-only, host injected like gcode-preview) and `extension.ts` (`activate`, the only runtime `vscode` import). Status item `G-code: <flavour>` on `gcode` documents, hidden otherwise; updates on editor switch, edits and config change; reads the first 64 KiB only.
- Override: setting `vsslicer.gcode.flavourOverrides` (object: workspace-relative path or absolute path -> marlin|klipper|reprapfirmware). Chosen over a workspaceState command because VS Code settings cannot be scoped to one file, so a path-keyed map is the simplest real per-file setting; it is plain text in settings.json, shareable, and needs no command/UI. Not done: a click-to-pick command on the status item.
- package.json: `main`, `activationEvents` onLanguage:gcode, `contributes.configuration`, `files` + dist, `build` = `tsc && vsslicer-bundle`, devDeps `@types/vscode` 1.100.0 and `esbuild` 0.28.2 (lockfile updated by pnpm install, +11 lines). tsconfig include gained `src`.
- Tests `test/flavour.test.ts` (4 tests, plain Node): detection incl. last-wins and real fixtures, label mapping, status item via a stub host ('generic' for unknown, override wins). No integration harness run (downloads VS Code, not cheap); stub test runs in ~1 ms.
- Verified: `pnpm install && pnpm lint && pnpm test && pnpm build` all pass; 7 node tests (3 existing + 4 new), 7 grammar snapshots; dist/extension.js built.
- CHANGELOG (coordinator): `- Added: status-bar item showing the detected G-code flavour ('generic' when unknown), and the vsslicer.gcode.flavourOverrides setting to override it per file.`
- Not touched by coordinator-only rules: version, CHANGELOG. README not updated (mention the setting if wanted).
- Files: package.json, pnpm-lock.yaml, tsconfig.json, src/domain/flavour.ts, src/presentation/status.ts, src/presentation/extension.ts, test/flavour.test.ts.
- Review (gcode44-review): PASS, install --frozen-lockfile/lint/test (7 node + 7 grammar)/build green; domain has no vscode import, only extension.ts imports it at runtime (bundle requires vscode externally); detection matches gcode-parser 0.11.0 SlicerTags (comment-only lines, ;FLAVOR: and gcode_flavor =, case-sensitive, last wins, empty ignored; only difference: parser keeps the rest of the line, this takes the first token, harmless); override read per document URI via path-keyed map, status 'generic' for unknown; activation only onLanguage:gcode. Comment-only edit: flavour.ts shortcut note updated for 0.11.0 (ParsedFile.flavourName exists but no standalone header function). Note: the parser's 0.11.0 only reachable by a full parse, so shortcut stays.
