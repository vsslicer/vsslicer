# VSSlicer G-code Preview

Opens sliced G-code from any slicer in a read-only custom editor, without slicing anything and without loading the text into an editor.

| Files         | Editor                         | Priority                                                |
| ------------- | ------------------------------ | ------------------------------------------------------- |
| `*.bgcode`    | `vsslicer.gcode.preview`       | default                                                 |
| `*.gcode.3mf` | `vsslicer.gcode.preview`       | default (shows "not supported yet" until GCP-15/16)     |
| `*.gcode`     | `vsslicer.gcode.preview.gcode` | option ("Open With..."); default with the setting below |

Setting `vsslicer.gcode.preview.openGcodeByDefault` (default `false`): when on, the extension adds `"*.gcode": "vsslicer.gcode.preview.gcode"` to `workbench.editorAssociations` in user settings; turning it off removes that entry (and no other).

## How a file opens

1. `openCustomDocument` starts one worker thread (`dist/worker.js`): it streams the file, decodes `.bgcode` to its text, parses it into move buffers and times them with the planner of the file's flavour (Klipper, else Marlin). Closing the editor terminates the worker.
2. The result moves to the extension host (transferred, not copied) and stays there for the editor's lifetime, so a reloaded webview is served again without re-parsing.
3. On every webview load (webview-kit handshake) the host posts the state (`loading`, then `ready` with a JSON summary, `unsupported` or `error` with a code) and sends each move buffer as an `ArrayBuffer` stream (`sendBuffer`).
4. The webview shows a summary of what it received, saves its view state with `setState`, and reports the buffers it got back to the host.

Layers: `domain` (file kinds, summary, editor associations), `application` (`loadPreview`: decode, parse, plan; `openPreview`: the session that serves a webview), `adapters` (worker entry and loader), `presentation` (provider, activation, webview script).

## Develop

```sh
pnpm install && pnpm lint && pnpm test && pnpm build
pnpm test:integration   # VS Code 1.100.0 and stable, one fixture per slicer
pnpm package            # VSIX
```

Licensed `AGPL-3.0-or-later`; bundled third-party packages are listed in `THIRD-PARTY-NOTICES.md`.
