---
id: 81
title: Fail the build when a browser entry reaches a Node built-in
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [80, 4]
created: 2026-10-25
---

Traverses the esbuild metafile from each browser entry and fails on any import of a Node built-in (`fs`, `worker_threads`, `child_process`, `net`, every name in `module.builtinModules`, with or without `node:`), naming the importing file and the chain from the entry.

**Code:** `vsslicer/modules/tooling/src/lint/...` (module: `tooling`, layer: `adapters`)

## Acceptance criteria

- [ ] A fixture module importing `fs` from a browser entry fails the check with the chain printed (the regression: a desktop-only import that breaks activation on vscode.dev)
- [ ] A built-in used only from the `main` entry passes; a type-only import passes
- [ ] A meta-test proves the check turns CI red (as the other harness meta-tests do)

## Tasks

- [ ] Metafile traversal
- [ ] Built-in list
- [ ] Fixtures
- [ ] Meta-test

## Progress

Not started.
