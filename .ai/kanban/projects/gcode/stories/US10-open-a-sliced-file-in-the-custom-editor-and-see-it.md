---
id: US10
title: "Open a sliced file in the custom editor and see it in 3D"
status: reviewed
epic: VSS:E5
---

As any 3D-printing user, I want double-clicking a `.gcode`, `.bgcode` or `.gcode.3mf` to open a 3D preview coloured by feature, speed, width, flow, fan, temperature, layer time or tool, with no other extension and no slicing.

## Acceptance criteria

- [ ] A fixture from each of the five slicers opens in the custom editor
- [ ] Playwright pixel snapshots pass for each colour mode, layer range and travel toggle on corpus files
- [ ] The text never becomes a `TextDocument`; worker parse, then buffers go to the webview as ArrayBuffers
- [ ] `retainContextWhenHidden` is on, GPU resources are freed on dispose, camera, layer and mode survive via `setState`
- [ ] `*.gcode` is registered as `option` behind a setting, `*.bgcode` and `*.gcode.3mf` as `default`

## Out of scope

- Simulation (US12), failure UI (US13), API (E7)
