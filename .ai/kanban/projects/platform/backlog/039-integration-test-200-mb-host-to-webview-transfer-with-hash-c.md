---
id: 39
title: "Integration test: 200 MB host to webview transfer with hash check"
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [36, 37, 15, 31]
created: 2026-10-25
---

End-to-end check inside VS Code that the transport moves 200 MB intact.

## Acceptance criteria

- [ ] `@vscode/test-electron` test transfers 200 MB and the webview's hash equals the host's
- [ ] Elapsed time and memory printed; test runs on the CI matrix (or documented as a nightly if too slow)

## Tasks

- [ ] Write the sample webview handler
- [ ] Generate payload at test time
- [ ] Compare hashes

## Progress

Not started.
