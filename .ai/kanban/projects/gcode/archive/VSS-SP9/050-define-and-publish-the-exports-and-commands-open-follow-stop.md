---
id: 50
title: "Define and publish the exports and commands: open, follow, stopFollow"
type: feature
priority: P1
effort: M
model: opus
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP9"
depends_on: [49, 30]
created: 2026-10-25
---

The cross-project contract; commands too because ui-kind PRN runs in another extension host under Remote-SSH and WSL.

## Acceptance criteria

- [x] `exports` and the commands `vsslicer.gcode.open`, `.follow`, `.stopFollow` exist with serialisable arguments
- [ ] Versioned types are exported from `@vsslicer/gcode` (D20: `@vsslicer/gcode-api`; types written, export lines below for the coordinator)
- [x] `PreviewSession.reveal(position)` and `setPlate` exist
- [x] Every command argument is validated at the boundary: URIs as strings (at most 8192 chars, with a scheme) or `Uri`; plate an integer 1..1000; fileOffset and layer finite non-negative integers within the file; percent 0..100; z finite (tested)
- [x] Unknown fields of a position or of the open options are refused (tested)
- [x] A follow feed coalesces updates: one reveal in flight, at most one pending position, newest wins (tested)

## Tasks

- [x] Types
- [x] Exports
- [x] Commands
- [x] Session methods

## Progress

- 2026-10-26 sp9-gcp-50: Done in `vsslicer/modules/gcode-preview` (the `vsslicer.gcode` extension).
  - domain `src/domain/print-position.ts`: `PrintPosition` (D20), `parsePosition` (refuses unknown fields, none set,
    fileOffset outside u32 0..2^32-1, layer not a non-negative safe integer, z not finite, percent outside 0..100),
    `resolvePosition` in D20's order fileOffset > layer > z > percent: binary search over the chunked move buffers
    (fileOffset, and percent by start time = percent/100 * totalTime), log2(moves) reads; layer N -> `layers[N-1].firstMove`,
    0 -> move 0, past the last layer -> RangeError; z -> last layer at or below it. Returns `{by, move}` so the UI can mark
    `percent` as approximate.
  - application `src/application/follow.ts`: `createFollower`, one reveal in flight, one pending slot, newest wins,
    `stop()` drops the pending. `PreviewSession.reveal(position)` (awaits the load, resolves, posts
    `{action:'seek', move}` to every served webview); `selectPlate` renamed `setPlate` (only internal callers).
  - presentation `src/presentation/commands.ts`: `registerCommands` returns `GcodePreviewApi {version: 1, open, follow,
    stopFollow}` and registers the same functions as `vsslicer.gcode.open/.follow/.stopFollow`. open uses
    `vscode.openWith` with the view type for the file kind, then `setPlate` after the first load. follow validates
    synchronously, opens the preview on the first call, coalesces per URI, and ends when the preview is closed.
    `extension.ts` returns `{...probe, ...api}`; `PreviewProbe.session(uri)` added. Webview: `TimelineCommand` gains
    `seek` (pauses, seeks to the move's start time).
  - Verified: `pnpm test` 101/101 (9 new in `test/follow.test.ts`), `pnpm lint`, `pnpm build` clean.
    `node scripts/run.mjs checks` fails only on `gcode-planner/test/fixtures/klipper-estimator: missing PROVENANCE.md`,
    not this card's files. VS Code integration suite not run (coordinator).
  - Not done: "within the file" for fileOffset is the u32 offset space; an offset past the last move shows the last move
    (the parse records no text length). M73 P/L resolution is D20's follow-up. The types live in gcode-preview, not
    gcode-api: moving `print-position.ts`'s `PrintPosition` to gcode-api needs a gcode-api release first.
  - Shared-file lines for the coordinator:
    - `vsslicer/modules/gcode-preview/package.json`, under `contributes`:
      ```json
      "commands": [
        { "command": "vsslicer.gcode.open", "title": "Open G-code Preview", "category": "VSSlicer" },
        { "command": "vsslicer.gcode.follow", "title": "Follow Print Position", "category": "VSSlicer" },
        { "command": "vsslicer.gcode.stopFollow", "title": "Stop Following Print", "category": "VSSlicer" }
      ],
      "menus": { "commandPalette": [
        { "command": "vsslicer.gcode.follow", "when": "false" },
        { "command": "vsslicer.gcode.stopFollow", "when": "false" }
      ] }
      ```
      and `"activationEvents"` already has `onStartupFinished` (commands also activate it on use since VS Code 1.74).
    - `vsslicer/modules/gcode-api/src/index.ts` (with `print-position.ts`'s `PrintPosition`, `ResolvedBy`, `Revealed`
      and `parsePosition` moved to `gcode-api/src/domain/print-position.ts`, then gcode-preview importing them):
      ```ts
      export { parsePosition } from './domain/print-position.ts';
      export type { PrintPosition, ResolvedBy, Revealed } from './domain/print-position.ts';
      ```
    - CHANGELOG (gcode-preview, minor): "Added: `exports` and commands `vsslicer.gcode.open`, `.follow`, `.stopFollow`
      (GCP-50, D20); `PreviewSession.reveal` and `setPlate` (renamed from `selectPlate`)."
- 2026-10-26 **Review failed (sp9-rev-gcp-50)**
  - Ran in `vsslicer/modules/gcode-preview`: `pnpm test` 101/101 pass, `pnpm lint` clean (eslint incl. layer
    boundaries, prettier, tsc), `pnpm build` clean; `node scripts/run.mjs checks` exit 0 (the klipper-estimator
    PROVENANCE failure the worker saw is gone). VS Code integration suite not run, as instructed.
  - Mutation probes in a `mktemp -d` copy, `test/follow.test.ts`: follower keeps oldest pending (2 fail), stop not
    dropping pending (1 fail), unknown position fields accepted (1 fail), percent bound 1000 (1 fail), unknown open
    option accepted (1 fail), non-strict `Uri.parse` (2 fail). **URI length limit removed: 0 fail** (survives).
  - Checked: every argument of open/follow/stopFollow is validated synchronously before any open (URI string <= 8192
    with scheme, or `Uri`; plate integer 1..1000; position fields, ranges, unknown fields); follower has one reveal in
    flight and one pending slot, newest wins, per URI; no `selectPlate` left anywhere in `vsslicer/` (grep, excluding
    node_modules/dist); layers point inward (domain print-position, application follow/preview-session, presentation
    commands with a type-only `vscode` import).
  - Problem: `test/follow.test.ts:257` `'x'.repeat(8193)` has no scheme, so it is refused by strict parse and never
    reaches the 8192 limit at `src/presentation/commands.ts:50`; the AC says that limit is tested. Fix: give it a
    scheme and a G-code name, e.g. `` `file:///${'x'.repeat(8190)}.gcode` ``, and keep a just-under case
    (`file:///` + 8180 x + `.gcode`) that opens.
  - Not blocking, worth taking with the fix: `src/application/follow.ts:23` a `reveal` that throws synchronously (or an
    `onError` that throws) leaves `busy` true and the feed dead; wrap as `Promise.resolve().then(() => reveal(p))`.
    After `stopFollow` + `follow` while a reveal is in flight, two reveals for one URI briefly overlap (harmless).
  - AC 2 (types in `@vsslicer/gcode-api`): judged on what the worker could do; the types are written and the export
    lines are in the Progress above. Recommend the coordinator move them now in this sprint's gcode-api release:
    `PrintPosition`, `ResolvedBy`, `Revealed`, `parsePosition` (pure, no deps beyond gcode-api) and the `Command` ids,
    so PRN adapters depend on the contract module and not on the gcode-preview extension. `resolvePosition`,
    `GcodePreviewApi` (uses `vscode.Uri`) and `createFollower` stay in gcode-preview.
- 2026-10-26 **Fix after review (sp9-gcp-50-fix)**
  - `test/follow.test.ts`: the over-limit case is now `` `file:///${'x'.repeat(8179)}.gcode` `` (8193 characters,
    scheme and G-code name, so only the length limit refuses it), and a new case opens a URI of exactly 8192
    characters (`opened.length` 3).
  - `src/application/follow.ts`: a `reveal` that throws synchronously becomes a rejected promise (reveal is still
    called synchronously, so the first push shows at once), and a throwing `onError` is swallowed, so neither leaves
    `busy` set. New test: "a reveal or onError that throws synchronously does not stop the feed".
  - Verified: `pnpm test` 102/102, `pnpm lint` clean, `pnpm build` clean, `node scripts/run.mjs checks` exit 0.
    Mutation probes in a `mktemp -d` copy: URI length limit removed (1 fail), sync-throw guard removed (1 fail),
    onError-throw guard removed (1 fail).
  - Not done: the gcode-api type move (left for a later card, as instructed); the brief overlap after
    `stopFollow` + `follow` during a reveal (harmless, per the reviewer).
- 2026-10-26 **Review passed (sp9-rerev-gcp-50)**
  - Ran in `vsslicer/modules/gcode-preview`: `pnpm test` 102/102 pass, `pnpm lint` clean (eslint incl. layer
    boundaries, prettier, tsc), `pnpm build` clean; `node scripts/run.mjs checks` exit 0. Unit tests only.
  - Previous FAIL fixed: `test/follow.test.ts` over-limit URI is now 8193 chars with scheme and `.gcode`, plus an
    exactly-8192 case that opens. Mutations in a `mktemp -d` copy (`test/follow.test.ts`, 10 tests): length limit
    removed (1 fail), limit off by one `>=` (1 fail). Follower sync-throw guard removed (1 fail), onError guard removed
    (1 fail), reveal deferred to a microtask (1 fail).
  - Whole card re-checked, mutations each caught: oldest pending kept (2 fail), stop keeps pending (1), unknown open
    option (1), non-strict `Uri.parse` (2), percent bound 1000 (1), infinite z (1), fileOffset/layer any number (1 each),
    unknown position field (1), empty position (1), layer past end (2), fileOffset priority (1), binary search `<` (2).
  - AC 2 judged on the types being written and exported from the module, as instructed: `PrintPosition`, `ResolvedBy`,
    `Revealed` in `src/domain/print-position.ts`, re-exported from `src/presentation/commands.ts` with
    `GcodePreviewApi`, `Command`, `GCODE_PREVIEW_API_VERSION`. The gcode-api move stays with the coordinator.
  - No fixes made in place.
- Moved SP5 to SP6 at SP5 start: the gcode-preview lane is full (one card per module at a time); it also waits on GCP-49's spike, which runs in SP5.
