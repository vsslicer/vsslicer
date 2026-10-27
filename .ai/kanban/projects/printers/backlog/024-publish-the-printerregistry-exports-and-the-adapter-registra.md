---
id: 24
title: Publish the PrinterRegistry exports and the adapter registration API
type: feature
priority: P0
effort: M
model: opus
area: [api]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [17, 16]
created: 2026-10-25
---

The public surface other extensions use: list, status events, `upload(uri, opts)`, `job`, `files`, `cameras()`, and `registerAdapter`.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Versioned exported types; `registerAdapter(descriptor)` from another extension makes its host type available
- [ ] Where the spike said exports do not cross hosts, equivalent commands with serialisable arguments exist
- [ ] A stub extension in `@vscode/test-electron` registers an adapter and lists printers

## Tasks

- [ ] Exports and types
- [ ] Commands fallback
- [ ] Stub extension test

## Progress

Not started.
