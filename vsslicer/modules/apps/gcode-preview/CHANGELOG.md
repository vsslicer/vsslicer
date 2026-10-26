# Changelog

## Unreleased

- GCP-32: colour modes feature, speed, tool and layer time, switched with a uniform (no geometry re-upload, counted), legend data, the mode kept in the webview state. Width, flow, fan and temperature: GCP-96.
- GCP-33: orbit (drag), pan (right or shift drag) and zoom (wheel), top/iso/front view buttons; the camera (pure, unit-tested `camera.ts`) is kept in the webview state across hide and show.
- GCP-31: the preview draws the moves with webview-kit's instanced segment renderer (libvgcode port, AGPL-3.0): moves up to the saved layer, role and flag masks in the webview state (travels hidden by default), a camera that frames the print, GPU resources freed on dispose and rebuilt after a context loss. Per-chunk move buffers are joined once in the webview.

## 0.2.1

- Depends on gcode-parser ^0.10.1 (SP4 re-lock).

## 0.2.0

- GCP-87: depends on gcode-api ^0.5.0, gcode-parser ^0.10.0, gcode-planner ^0.3.0 and webview-kit ^0.5.0. The webview uses webview-kit's `createWindowChannel` (the local window channel is gone). Files are timed with `plannerFor`: Bambu, Klipper, RepRapFirmware or Marlin.

## 0.1.0

- GCP-30: the `vsslicer.gcode.preview` read-only custom editor (`CustomReadonlyEditorProvider`, `supportsMultipleEditorsPerDocument: false`, `retainContextWhenHidden: true`). `*.bgcode` and `*.gcode.3mf` open in it by default; `*.gcode` is an `option` (`vsslicer.gcode.preview.gcode`, "Open With..."), and the default when `vsslicer.gcode.preview.openGcodeByDefault` is on (the extension then writes a `*.gcode` entry to `workbench.editorAssociations` in user settings, and removes only that entry when it is turned off).
- One worker thread per file (`dist/worker.js`) reads the file, decodes `.bgcode` to text (`@vsslicer/gcode-bgcode`), parses (`@vsslicer/gcode-parser`) and times it (`@vsslicer/gcode-planner`: Klipper planner for Klipper files, Marlin otherwise), then moves the result to the host. The text never becomes a `TextDocument`. Errors are states with a code (`memory-cap`, `worker-crashed`, `parse-failed`, `ENOENT`, `not-local`); closing the editor terminates the worker.
- The host sends the webview a JSON summary and each move buffer (start times filled in) as an `ArrayBuffer` stream through `@vsslicer/webview-kit` (`sendBuffer`, handshake per webview load, kit CSP, `localResourceRoots` = `dist`). The webview shows a summary of what it received and saves its view state with `setState`; the renderer comes with later E5 cards.
- `.gcode.3mf` opens with a "not supported yet" state: reading it is GCP-15/16 (SP7).
