---
id: 82
title: Add the @vscode/test-web harness
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [80, 15]
created: 2026-10-25
---

A shared runner that serves an extension's browser bundle to `@vscode/test-web`, runs its mocha tests in headless Chromium and exposes `test:web` per extension, like `test:integration` for desktop.

**Code:** `vsslicer/modules/tooling/tooling/src/test-web/...` (module: `tooling`, layer: `adapters`)

## Acceptance criteria

- [ ] The sample extension's web test passes in headless Chromium on Linux; a failing test exits non-zero
- [ ] The VS Code web download is cached by version; logs and the browser console are written to an artefact
- [ ] The runner works with a workspace folder mounted from fixtures

## Tasks

- [ ] Runner
- [ ] Caching and logs
- [ ] Sample test

## Progress

Not started.
