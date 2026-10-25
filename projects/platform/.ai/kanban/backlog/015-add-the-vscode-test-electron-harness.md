---
id: 15
title: Add the @vscode/test-electron harness
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
depends_on: [14, 9]
created: 2026-10-25
---

A shared runner (`tools/test-vscode`) that downloads a VS Code version, installs xvfb on Linux, runs mocha tests inside the extension host, and exposes `test:integration` per extension.

## Acceptance criteria

- [ ] The sample extension activates on the `engines.vscode` minimum and on stable on the local OS
- [ ] Test results and the VS Code console log are written to an artefact
- [ ] The runner caches the VS Code download keyed by version
- [ ] A failing test exits non-zero

## Tasks

- [ ] Write the runner and mocha bootstrap
- [ ] Add xvfb handling
- [ ] Add log capture (reused for CSP checks by E2)
- [ ] Wire `test:integration`

## Progress

Not started.
