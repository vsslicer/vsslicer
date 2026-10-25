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
