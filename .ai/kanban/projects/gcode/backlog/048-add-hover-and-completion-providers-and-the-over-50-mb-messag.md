---
id: 48
title: Add hover and completion providers and the over-50-MB message
type: feature
priority: P0
effort: M
model: sonnet
area: [language]
story: US16
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [46, 44]
created: 2026-10-25
---

Plain providers in the extension host, no language server. Slicer tag comments have hovers.

## Acceptance criteria

- [ ] Every catalogued command has a hover and completion offers commands and parameters per flavour (`@vscode/test-electron` per flavour)
- [ ] Unknown commands warn only when the flavour is known
- [ ] A file over 50 MB opens in the preview and language features say why they are unavailable

## Tasks

- [ ] Hover provider
- [ ] Completion provider
- [ ] Tag comment hovers
- [ ] Large-file message
- [ ] Integration tests

## Progress

Not started.
