---
id: 145
title: Publish `vsslicer.themes` to both marketplaces and check the install
type: chore
priority: P3
effort: S
model: sonnet
area: [publishing]
story: US69
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [144, 25, 26, 16]
created: 2026-10-25
---

Pushes the `themes@0.1.0` tag through the release workflow to open-vsx.org and the Microsoft marketplace and records the install checks in stock VS Code and VSCodium.

**Code:** `.github/workflows/release.yml` (module: none, layer: n/a (ci))

## Acceptance criteria

- [ ] The extension is live on both marketplaces and installs in stock VS Code and VSCodium (versions recorded)
- [ ] Re-running the workflow reports both as already published
- [ ] The themes list shows four colour themes and the icon theme is selectable

## Tasks

- [ ] Tag and publish
- [ ] Record the install checks in the module README

## Progress

Not started.
