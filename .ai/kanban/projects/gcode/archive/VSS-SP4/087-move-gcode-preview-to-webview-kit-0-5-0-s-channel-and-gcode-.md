---
id: 87
title: "Move gcode-preview to webview-kit 0.5.0's channel and gcode-planner 0.3.0's plannerFor"
type: chore
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-87-worker
created: 2026-10-26
---

Module: gcode-preview (presentation webview, application). Follow-up of GCP-30 found in SP4: gcode-preview 0.1.0 locks gcode-api 0.4.1, gcode-parser 0.8.5, gcode-planner 0.2.1 and webview-kit 0.4.2, uses its own window channel (shortcut comment in `src/presentation/webview/main.ts`) because webview-kit 0.4.2 dropped host messages (fixed by PLT-188 and PLT-39 in webview-kit 0.5.0), and routes only Klipper versus Marlin (gcode-planner 0.3.0 has `plannerFor` with RRF and Bambu).

## Acceptance criteria

- [x] Depends on gcode-api ^0.5.0, gcode-parser ^0.10.0, gcode-planner ^0.3.0, webview-kit ^0.5.0; a clean-store frozen install passes
- [x] The webview uses webview-kit's `createWindowChannel`; the shortcut channel is gone; `pnpm test:integration` passes on VS Code 1.100.0 and stable
- [x] Planner choice goes through `plannerFor` (RRF and Bambu files get their planners; test)

## Tasks

- [x] Raise ranges and re-lock
- [x] Swap the channel
- [x] Use plannerFor
- [x] Release 0.2.0

## Progress

Done. gcode-preview 0.2.0 published to the local registry. Ranges raised to gcode-api ^0.5.0, gcode-parser ^0.10.0, gcode-planner ^0.3.0, webview-kit ^0.5.0; lockfile proven with a clean-store `pnpm install --frozen-lockfile`. The webview uses `createWindowChannel(api.post, window)`; the local channel is gone. `loadPreview` uses `plannerFor` (test: Bambu fixture gets the Bambu planner output, an RRF config differs from Marlin). Verified: `pnpm lint`, `pnpm test` (23 pass), `pnpm build`, `pnpm test:integration` (VS Code 1.100.0 and stable 1.143.1, 9 passing each). PROVENANCE.md notes the libvgcode port in webview-kit's `gl` entry; gcode-preview does not bundle that entry yet.

Files: vsslicer/modules/gcode-preview/{package.json,pnpm-lock.yaml,CHANGELOG.md,PROVENANCE.md,src/application/load-preview.ts,src/presentation/webview/main.ts,test/load.test.ts}
