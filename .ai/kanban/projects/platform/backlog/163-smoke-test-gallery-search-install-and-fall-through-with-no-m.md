---
id: 163
title: "Smoke test: the extensions view installs from the marketplace index, with no Microsoft or Open VSX request"
type: chore
priority: P0
effort: M
model: sonnet
area: [ci]
story: US66
milestone: "VSS:M6"
sprint: "VSS:SP17"
depends_on: [160, 210, 126]
created: 2026-10-25
---

D24: the build has no gallery; its extensions view reads `index.json`. This proves it, and that nothing reaches the Microsoft Marketplace or open-vsx.org.

**Code:** `test/smoke/` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] With the build pointed at a fixture `index.json` served locally, the VSSlicer extensions view lists it and installs one extension
- [ ] A proxy log of the whole smoke run shows no request to `marketplace.visualstudio.com`, `*.gallery.vsassets.io`, `open-vsx.org` or `*.vscode-unpkg.net`
- [ ] A VSIX with a wrong `sha256` is refused

## Tasks

- [ ] Local index server and proxy
- [ ] Checks

## Progress

Not started.
