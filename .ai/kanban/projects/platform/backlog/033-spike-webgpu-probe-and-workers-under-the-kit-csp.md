---
id: 33
title: "Spike: WebGPU probe and workers under the kit CSP"
type: spike
priority: P1
effort: M
model: opus
area: [webview-kit]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP4"
depends_on: [15, 32]
created: 2026-10-25
---

A probe of about 20 lines: `navigator.gpu.requestAdapter()` inside a webview and `Worker` from `blob:` and from `asWebviewUri` under the kit's CSP. WebGL2 stays the baseline either way (D6).

## Acceptance criteria

- [ ] Results on Windows, macOS and Linux with VS Code version and GPU, in `.reference/notes/`
- [ ] Proposed decisions on the VSS board: WebGPU availability and worker support
- [ ] CSP helper adjusted (`worker-src`) if the result requires it

## Tasks

- [ ] Write the probe
- [ ] Run on the three OSes (ask owner)
- [ ] Write note and propose decisions

## Progress

Not started.
