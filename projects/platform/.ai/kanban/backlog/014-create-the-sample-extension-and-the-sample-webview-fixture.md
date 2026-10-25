---
id: 14
title: Create the sample extension and the sample webview fixture
type: feature
priority: P0
effort: S
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [3]
created: 2026-10-25
---

Module: `example-extension`, with the webview fixture in `vsslicer/fixtures/sample-webview`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

A minimal extension (`fixtures/sample-extension`) with one command and one webview that the integration and snapshot harnesses and the kit tests use.

## Acceptance criteria

- [ ] Bundles with the esbuild helper; activates and registers the command
- [ ] Contains `PROVENANCE.md`
- [ ] The webview page loads a bundle built from `fixtures/sample-webview`

## Tasks

- [ ] Write the extension and the webview bundle
- [ ] Add `PROVENANCE.md`
- [ ] Build through Turborepo

## Progress

Not started.
