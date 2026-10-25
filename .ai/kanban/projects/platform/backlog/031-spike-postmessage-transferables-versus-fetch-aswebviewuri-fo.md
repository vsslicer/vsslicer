---
id: 31
title: "Spike: postMessage transferables versus fetch(asWebviewUri) for 50 to 500 MB"
type: spike
priority: P0
effort: L
model: opus
area: [webview-kit]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [15, 30]
created: 2026-10-25
---

Decides whether the kit's transport carries bulk data in messages or streams file-backed data over `fetch(asWebviewUri)`. Needs the owner's Windows, macOS and Linux machines for the numbers: ask on the board.

## Acceptance criteria

- [ ] Both methods measured at 50, 200 and 500 MB on Windows, macOS and Linux with time, peak memory, OS, GPU and VS Code version; raw data in `.reference/notes/`
- [ ] Proposed decision on the VSS board stating the method and chunk size the kit uses
- [ ] Findings feed the transport tasks

## Tasks

- [ ] Write the probe extension using the harness
- [ ] Run on the three OSes (ask owner)
- [ ] Write note and propose decision

## Progress

Not started.
