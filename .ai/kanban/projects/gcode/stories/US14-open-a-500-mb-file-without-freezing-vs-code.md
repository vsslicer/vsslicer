---
id: US14
title: "Open a 500 MB file without freezing VS Code"
status: reviewed
epic: VSS:E5
---

As a user with a huge print, I want the preview to open files from 50 to 500 MB inside the memory budget, so large multi-material jobs are not a special case.

## Acceptance criteria

- [ ] `@vscode/test-electron` opens a file over 50 MB through the custom editor, asserts it is not a `TextDocument` and that the host thread is never blocked over 100 ms
- [ ] Memory test at 50, 200 and 500 MB records peak host, worker and webview memory (under about 1 GB total at 500 MB); budget regressions fail CI
- [ ] Verified on a CI runner with SwiftShader or a GPU

## Out of scope

- Level-of-detail merging (only if US6 decides it is needed)
