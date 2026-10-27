---
id: 86
title: "Spike: nested workers, CSP and memory in the web extension host"
type: spike
priority: P2
effort: M
model: opus
area: [web]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [80, 82, 14]
created: 2026-10-25
---

Roadmap question 30 asks whether the web build is worth maintaining, and the epic's riskiest unknown is whether a worker can start from the web extension host (itself a WebWorker) under vscode.dev's CSP. Build a sample web extension that tries it and measure the largest buffer a tab holds.

**Code:** `vsslicer/modules/apps/example-extension/docs/web-workers.md` (module: `example-extension`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] On vscode.dev (Chromium) and in the `@vscode/test-web` host, the sample records whether a nested Worker starts, with how it was created (Blob URL, file URL) and the CSP message when it does not
- [ ] A memory measurement states the largest file (parsed buffers included) that opens without the tab crashing; the web size limit is set from it with a margin
- [ ] The decision names the fallback (chunked in-host parsing with yields at a lower limit) and the numbers; findings are in `vsslicer/modules/apps/example-extension/docs/web-workers.md` with browser versions and dates

## Tasks

- [ ] Build the probe extension
- [ ] Measure in vscode.dev and test-web
- [ ] Write the decision

## Progress

Not started.
