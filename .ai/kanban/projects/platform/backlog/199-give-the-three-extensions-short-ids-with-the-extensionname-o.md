---
id: 199
title: Give the three extensions short ids with the extensionName override
type: chore
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP33"
depends_on: [196]
created: 2026-10-26
---

Q22 consumers (from PLT-196, SP9): tooling 0.8.4 has the `vsslicer.extensionName` override. Set it in the three extensions so their VSIX ids are short.

**Code:** `package.json` `"vsslicer"` of printers-extension, slicer-extension, project-extension (package, presentation)

## Acceptance criteria

- [ ] `"extensionName": "printers"`, `"slicer"`, `"project"`; each module re-locked to tooling ^0.8.4 if needed, VSIX packs as `vsslicer.<name>`; integration suites pass

## Progress

Not started.
