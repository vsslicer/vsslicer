---
id: 30
title: "Register the custom editor and orchestrate parse, plan and transfer"
type: feature
priority: P0
effort: L
model: opus
area: [editor]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-30-worker
depends_on: [6, 19, PLT-15, PLT-17, PLT-30]
created: 2026-10-25
---

`CustomReadonlyEditorProvider` for the three types with `supportsMultipleEditorsPerDocument` false. Needs PLT:E2 webview-kit (transport, CSP helper, WebGL2 core) from the platform worker.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] Opens a fixture from each of the five slicers with no other extension installed (`@vscode/test-electron`)
- [x] Text never becomes a `TextDocument` (test asserts it)
- [x] Buffers reach the webview as ArrayBuffers; `retainContextWhenHidden` is on; state saved via `setState`
- [x] `*.bgcode` and `*.gcode.3mf` are `default`, `*.gcode` is `option` behind a setting

## Tasks

- [x] Provider and document model
- [x] Worker orchestration
- [x] Transfer through webview-kit
- [x] Registration and setting
- [x] Test

## Progress

Done: new module `vsslicer/modules/gcode-preview` (`@vsslicer/gcode-preview` 0.1.0, published to the local registry).

- **Registration**: two customEditors entries on one `CustomReadonlyEditorProvider` (`supportsMultipleEditorsPerDocument: false`, `retainContextWhenHidden: true`): `vsslicer.gcode.preview` for `*.bgcode` and `*.gcode.3mf` (`default`), `vsslicer.gcode.preview.gcode` for `*.gcode` (`option`; priority is static per entry, so two view types). Setting `vsslicer.gcode.preview.openGcodeByDefault` (default false) writes or removes only our `*.gcode` entry in user `workbench.editorAssociations`.
- **Worker orchestration**: one worker thread per file (`dist/worker.js`, application `loadPreview`): stream the file, decode `.bgcode` to text (gcode-bgcode), `parse` + `collect` (gcode-parser), `resolveLimits` + `runPlanner` (Klipper planner for Klipper, Marlin otherwise; RRF/Bambu wait for gcode-planner's next release), transfer the result back. Abort on editor close terminates the worker; errors are states with a code (`memory-cap`, `worker-crashed`, `ENOENT`, `not-local`, ...). Our own worker instead of `parseInWorker` because the planner has no worker and `parseInWorker`'s `import.meta.url` entry breaks in a CommonJS bundle.
- **Transfer**: per webview load (webview-kit handshake) the host posts the state (`loading`, `ready` + JSON summary, `unsupported`, `error`) and each move buffer with `sendBuffer`; kit CSP, `localResourceRoots` = `dist`. The webview shows a minimal summary, saves its view state with `setState` and reports back what it received (byte length, `instanceof ArrayBuffer`).
- **`.gcode.3mf`**: registered `default`, opens with a "not supported yet" state; reading it moved to SP7 (GCP-15/16).

Verified: `pnpm install && pnpm lint && pnpm test && pnpm build` (22 unit tests), clean-store `pnpm install --frozen-lockfile`, `pnpm package` (56 KB VSIX), `pnpm test:integration` locally (no CI yet, Q7): 9 passing on VS Code 1.100.0 and stable 1.143.1, `--disable-extensions`: one fixture each from PrusaSlicer, SuperSlicer, Orca, Bambu Studio and Cura via `openWith`, the `.bgcode` and `.gcode.3mf` via `vscode.open` (default editor), the setting, and no previewed file ever in `onDidOpenTextDocument` or `workspace.textDocuments`.

Not done / needs others:
- **webview-kit bug** (needs a webview-kit fix, PLT): `createWindowChannel` drops every host message in VS Code 1.100.0 and stable (`event.source !== window.parent`), so its handshake never completes. gcode-preview's webview uses its own channel that checks `event.origin === location.origin` (shortcut comment in `src/presentation/webview/main.ts`). The `event.source === window.parent` line in `docs/research/vscode-platform.md` §2 is wrong for these versions.
- Not measured: host-thread blocking and >50 MB files (epic criteria, later cards); the renderer, GPU dispose and camera/mode state belong to the renderer cards.
- Notes: `.reference/notes/GCP-30-custom-editor.md`.

Files (all new, `vsslicer/modules/gcode-preview/`): `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `.prettierignore`, `.vscodeignore`, `tsconfig.json`, `eslint.config.mjs`, `LICENSE`, `README.md`, `CHANGELOG.md`, `PROVENANCE.md`, `THIRD-PARTY-NOTICES.md`; `src/domain/{file-kind,summary,associations}.ts`, `src/application/{load-preview,preview-session}.ts`, `src/adapters/{worker-entry,worker-loader}.ts`, `src/presentation/{extension,provider}.ts`, `src/presentation/webview/main.ts`; `test/{load,session,provider}.test.ts`, `test/integration/preview.test.ts`; `test/fixtures/{prusaslicer,superslicer,orca,bambu-studio,cura}/` (copies of the gcode-parser corpus with `PROVENANCE.md`).
