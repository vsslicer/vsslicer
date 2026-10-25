---
id: 176
title: Share the VS Code test download across modules
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP2"
docs: [.ai/audits/2026-10-25-repo-audit.md]
created: 2026-10-25
---

Module `test-vscode`, adapters layer. Each extension module downloads its own 1.2 GB VS Code into `.vscode-test` (finding 4). Found by the repository audit, finding in `.ai/audits/2026-10-25-repo-audit.md`.

## Acceptance criteria

- [ ] The default cache is `VSCODE_TEST_CACHE` or `~/.cache/vsslicer/vscode-test`, shared by every module
- [ ] CI caches that folder
- [ ] Two modules run their integration tests with one download

## Tasks

- [ ] Change the default in `run.ts`
- [ ] Cache step in the CI workflow
- [ ] Delete the per-module `.vscode-test` folders
- [ ] Release a patch version

## Progress

Not started.
