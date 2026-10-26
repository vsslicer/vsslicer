---
id: 110
title: "Snapshot real corpus files through the preview's webview"
type: chore
priority: P2
effort: M
model: sonnet
sprint: "VSS:SP7"
owner: sp7-gcp-110
depends_on: [34]
created: 2026-10-26
---

Follow-up from GCP-34 (SP6): the renderer snapshots in webview-kit use a synthetic part, because webview-kit cannot read gcode-preview's corpus. A gcode-preview spec should snapshot real corpus files through the preview's own load path.

**Code:** `vsslicer/modules/gcode-preview/test/` (module: `gcode-preview`, layer: presentation tests)

## Acceptance criteria

- [x] Snapshots of two corpus files (one Bambu, one PrusaSlicer) in feature and speed modes, a layer range and travel hidden, through gcode-preview's webview bundle on SwiftShader
- [x] Runs locally in under 2 minutes; CI waits on Q7

## Tasks

- [x] Harness page loading the preview bundle with a parsed file
- [x] Snapshot set

## Progress

Done. `test/snapshots.page.ts` bundles the preview's own `preview-renderer.ts` (createPreviewRenderer, as main.ts builds it) and draws a base64 move buffer on a 480x360 canvas; `test/snapshots.spec.ts` parses `bambu-studio/cube.gcode` and `prusaslicer/mini_cube_ps2.8.1.gcode` with `loadPreview` (committed fixtures, AGPL, see their PROVENANCE.md) and snapshots the canvas only in feature, speed, layer-range (layers 11-31) and travel-hidden views on SwiftShader: 8 PNGs in `test/__snapshots__/`. `playwright.config.ts` added. Note: it draws through the renderer, not main.ts (that needs a host handshake and carries the side panel); the preview's webview.js bundle is not loaded.

Files: test/snapshots.spec.ts, test/snapshots.page.ts, test/__snapshots__/*.png, playwright.config.ts.
Verified: from a scratch copy of the module with webview-kit's Playwright: `playwright test` 8 passed in 5 s, repeat run without --update passes; eslint and prettier clean on my files. Module `pnpm lint`/`tsc` fail elsewhere (side-panel.ts no-unused-expressions, panel.test.ts handlers: GCP-39's in-flight work) and on spec because `@playwright/test` is not yet a dependency. CI: not wired (waits on Q7).
Finding: printBounds falls back to travels for the PrusaSlicer fixture (no nonzero width column), so the default camera frames the cube as a dot; the page uses its own non-travel bounds.

### Coordinator: shared-file changes
- package.json devDependencies: `"@playwright/test": "1.64.1"` (as webview-kit); scripts: `"test:browser": "playwright test"`; run `pnpm install` to update pnpm-lock.yaml.
- Optional: CHANGELOG line "test: Playwright snapshots of Bambu and PrusaSlicer corpus files through the preview renderer (GCP-110)".

Review (sp7-rev-gcp3): PASS. `pnpm test:browser` 8 passed in 5.3 s wall (no --update; snapshots unchanged). node --test glob `test/*.test.ts` does not pick up `snapshots.spec.ts`; `pnpm lint` incl. tsc green now that @playwright/test is installed. Fixtures are the module's committed corpus files with PROVENANCE.md (test/fixtures/{bambu-studio,prusaslicer}). Chromium launched with --use-angle=swiftshader. Note: it draws through `preview-renderer.ts` (the preview's own renderer as main.ts builds it), not the built dist/webview.js; accepted as a reasonable reading of "through the webview bundle", since main.ts needs the host handshake. Follow-up worth a card: the worker's finding that printBounds falls back to travels for the PrusaSlicer fixture, so the default camera frames that cube as a dot.
