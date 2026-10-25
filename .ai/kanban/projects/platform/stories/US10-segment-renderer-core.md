---
id: US10
title: A viewer author draws millions of G-code moves with instanced segments and cheap colour and range changes
status: reviewed
epic: VSS:E2
---

A viewer author feeds the per-move typed arrays from GCP to `@vsslicer/webview-kit/gl` and gets an instanced-segment renderer with data textures, a visible range and role masks, shader-side colouring, and the option to draw inside a foreign three.js context, within the memory budget of the 500 MB case.

## Acceptance criteria

- [ ] Snapshot tests for a fixed synthetic move set in feature, speed, tool and layer-time colour modes, light and dark theme, at two visible ranges
- [ ] Switching colour mode or visible range issues no `texImage2D`, `texSubImage2D` or `bufferData` call (context spy)
- [ ] A move count above `MAX_TEXTURE_SIZE` squared per texture renders across several textures identically to a reference made with an artificially small limit
- [ ] 15 million synthetic moves render in headless Chromium with GPU-side bytes per move at or under the stated layout, measured and printed by the test
- [ ] The renderer draws into a three.js `WebGLRenderer` context and three.js renders correctly afterwards (snapshot of a mesh plus segments)

## Out of scope

- The G-code move layout and parser (E19); meshes, picking and three.js inside the kit; a WebGPU backend.
