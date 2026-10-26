---
id: 36
title: "Add the side panel: thumbnails, labels, summary and plate picker"
type: feature
priority: P0
effort: L
model: sonnet
area: [editor]
story: US11
milestone: "VSS:M1"
sprint: "VSS:SP7"
owner: sp7-gcp-36-fix
depends_on: [35, 8, 16]
created: 2026-10-25
---

Job information next to the view.

## Acceptance criteria

- [x] Thumbnails, object labels (hover highlights the object), summary with the slicer estimate next to ours are shown
- [x] Plate picker for `.gcode.3mf` switches plates; the H2C fixture opens by plate (test)
- [x] Bounds (rule 25, .gcode.3mf plates are untrusted): at most 256 plates and 10,000 object labels shown; a thumbnail is used only when its declared size is at most 4 MiB and it is image/png; label and summary strings are clipped to 256 characters; all text reaches the DOM as textContent, never innerHTML
- [x] Hostile test: a plate list over the caps and a label with markup render clipped, as text

## Tasks

- [x] Thumbnail and summary view
- [x] Label list and highlight
- [x] Plate picker

## Progress

Done. Domain `src/domain/panel.ts` (bounds: 256 plates, 10,000 labels, PNG-only thumbnails up to 4 MiB, 256-char strings; hover-highlight range split), `PreviewSummary.panel` replaces `objects`/`thumbnails`. `.gcode.3mf` now loads (it was "unsupported"): `src/application/load-3mf.ts` + worker + `LoadPort(path, kind, signal, plate?)`; `selectPlate` in the session and a `gcode-preview/plate` notification from the picker. Webview: `side-panel.ts` (thumbnails, summary with ours next to the slicer estimate, label list with hover/focus highlight, plate picker; all text via textContent), `main.ts` layout, `preview-renderer.ts` `draw(vis, highlight)`. Fixture: `test/fixtures/bambu-studio/h2c-cube.gcode.3mf` (module's own copy; one plate, so multi-plate switching is tested with a fake LoadPort).

Files: src/domain/panel.ts, src/domain/summary.ts, src/application/load-3mf.ts, load-preview.ts, preview-session.ts, src/adapters/worker-entry.ts, worker-loader.ts, src/presentation/webview/side-panel.ts, main.ts, preview-renderer.ts; tests test/panel.test.ts (new), session.test.ts, renderer.test.ts, integration/preview.test.ts (not run: needs VS Code).

Verified in the module: `pnpm lint` clean, `pnpm test` 80/80 pass, tsc clean. `pnpm build` runs tsc, bundle, worker (245 kB) and webview (78 kB) fine but FAILS at the last step, `third-party-notices`: `saxes@6.0.0: no LICENSE file` (the worker now bundles `@vsslicer/3mf` through gcode-parser's `./gcode-3mf`; same blocker as the CHANGELOG's GCP-111 note).

Not done / caveats: highlight is the gradient's first colour (blue) via Width mode with an out-of-range colorRange, until webview-kit has a tint uniform; not seen on a real GL context. `.bgcode` shows "slicer estimate not stated" (its estimate is in binary metadata). Added own caps beyond the card: 16 thumbnails, 64 summary lines, 4096 ranges per label. Thumbnail 4 MiB check uses the inflated size (>= declared).

### Coordinator: shared-file changes
- package.json: no dependency change (uses `@vsslicer/gcode-parser/gcode-3mf` from ^0.13.0, already declared). Minor version bump (0.5.0).
- CHANGELOG: "Side panel (GCP-36): thumbnails, object labels with hover highlight, summary with the slicer estimate beside ours, plate picker. .gcode.3mf files now open (first plate, then by picker) instead of the 'not supported yet' state."
- README: mention the side panel and .gcode.3mf support; drop the "not supported yet" note if present.
- THIRD-PARTY-NOTICES / build: the notices step fails on saxes (no licence file in the package); needs the GCP-111 fix (tooling allowance or a bundled licence text) before `pnpm build` passes.

### Fix (sp7-gcp-36-fix)
1. `dropUnusableThumbnails` (src/application/load-preview.ts, uses `usableThumbnail` from domain/panel.ts) runs in the worker before postMessage: embedded and plate thumbnails over 4 MiB or not PNG are dropped, so the host and session never hold them. Reviewer's hostile archive through the real worker: host thumbnail undefined. Buffers are not transferred (small views; transferring a shared buffer could throw). The inflate itself still happens in the worker (GCP-114).
2. preview-session: a controller per load; a new load aborts the previous (terminating its worker); `loading` is posted before the load is awaited; a superseded load delivers nothing (`state === p` check).
3. Retry reloads the chosen plate.
Tests: session.test.ts (rapid switching, Retry plate), panel.test.ts (no oversize thumbnail leaves the worker). `pnpm lint` clean, `pnpm test` 82/82, build:worker and build:webview OK; notices/integration/Playwright not run.
No shared-file changes.

### Review (sp7-rev-gcp36): FAIL
Ran in the module: `pnpm lint` (eslint, prettier, tsc) clean; `pnpm test` 80/80 pass; `vsslicer-bundle`, `pnpm build:worker` (245 kB), `pnpm build:webview` (78 kB) OK; notices step not run (known saxes/PLT-194). Integration test and Playwright not run (coordinator); the changed integration test reads correctly. Checked: no innerHTML/insertAdjacentHTML/outerHTML in src; labels and summary reach the DOM as textContent; layers clean (DOM only in presentation/webview, domain/application have no VS Code/DOM imports); hover highlight is correct against webview-kit 0.6.0's shader (`gradient` clamps `(v-1e9)/1e9` to 0, so palette(2,0); `colorRange` is per draw call, so the user's colour mode, the legend's `ranges()` and the select are untouched after hover ends); missing plate: `loadPlate` throws `no-such-plate`, `selectPlate` ignores plates the file does not list; `.gcode.3mf` now opens, as the card wants. Hostile probe (`/private/tmp/claude-501/sp7w.rh3N/gcp36/`: 407 KB archive, 300 plates, 10,005 slice_info objects, a 1000-char `<img onerror>` label, markup in a filament type, a 300 MiB-declared PNG on plate 1, a GIF on plate 2) through the real worker: picker 256 of 300, labels 10,000 of 10,005, label clipped to 256 and kept as literal text, GIF and the big PNG dropped from the panel, plate 999 rejected.

Failures:
1. The 4 MiB thumbnail cap is applied only after the full inflation, and in the host. `src/application/load-3mf.ts:22` passes `info.thumbnail` from `readGcode3mfPlate`, which inflates `Metadata/plate_N.png` with the 3mf default per-entry cap (512 MiB); the worker then structured-clones it (not transferred, `src/adapters/worker-entry.ts` transfer list is moves only) to the extension host, and the session keeps it in `loaded` for the editor's lifetime (`src/application/preview-session.ts:86`). `panelOf` drops it only afterwards (`src/domain/panel.ts:79`). Repro: the probe above; plate 1 gives `host thumbnail bytes 314572808`, host arrayBuffers +297 MiB, from a 407 KB file. Fix: check the entry's declared size (central directory) before inflating, e.g. a `maxThumbnailBytes` option in gcode-parser's `readGcode3mfPlate`, or at least drop an over-cap `thumbnail` inside the worker before `postMessage`.
2. Plate switching has no in-flight bound. `selectPlate` (`src/application/preview-session.ts:117`) starts a new worker load on every picker change and never stops the previous one (all loads share the session's one AbortSignal, so only dispose terminates them); the `loading` state reaches the webview only after the load finishes (`.then(() => deliver(...))` waits on `selectPlate`, which awaits the load), so the old `<select>` stays live meanwhile. Arrow keys on a focused closed `<select>` fire `change` per press in Chromium on Windows/Linux, so one can start N concurrent workers, each with a 1 GiB heap cap plus the archive read whole; every superseded load also triggers a duplicate `deliver` of the latest state and all its move buffers. Fix: abort/terminate the superseded load (a per-load AbortController) and post `loading` before awaiting.

Notes (not failures): retry after a failed plate switch reloads the first plate, not the chosen one; in gradient modes the highlight colour equals the gradient's low end, so a hovered object can look like slow/thin moves (worker's caveat, needs a tint uniform in webview-kit).

### Review (sp7-rev2-gcp): PASS
Re-review after the fix round. Ran in the module: `pnpm lint` (eslint, prettier, tsc) clean; `pnpm test` 82/82; `pnpm build:worker`, `pnpm build:webview` OK (notices step, integration test and Playwright not run, as instructed). Earlier FAIL 1: the first reviewer's hostile archive (407 KB, 300 MiB-declared PNG on plate 1, GIF on plate 2, 300 plates, 10,005 labels) through the real built `dist/worker.js`: host `plates.thumbnail` undefined, host `arrayBuffers` +0 MiB (was +297), no embedded thumbnail crosses; `dropUnusableThumbnails` runs in the worker before `postMessage`. Picker 256/300, labels 10,000/10,005, clipped to 256, markup kept as text, plate 999 `no-such-plate`. Earlier FAIL 2: own probe through `serve` with the real worker loader, 40 plate requests in one burst: 40 `loading` posts at once, 39 loads aborted within 0-1 ms (workers terminated), one live load 50 ms later, one `ready` (plate 42) delivered, no error state reaches the webview. Retry reloads the chosen plate (session.test.ts, read and run). Rechecked: no innerHTML/outerHTML/insertAdjacentHTML in src; no `vscode` import outside presentation; domain/application import no outer layer; no shared-file changes.
Notes (not failures): each `start` adds a `{ once }` listener to the session's abort signal that is never removed, so listeners grow by one per plate switch until dispose (tiny); a webview handshake landing while a plate load runs awaits that load, so a later switch can flash its "superseded" error before the new state arrives; a burst spawns one `Worker` per request before each is terminated (transient threads, not loads).
