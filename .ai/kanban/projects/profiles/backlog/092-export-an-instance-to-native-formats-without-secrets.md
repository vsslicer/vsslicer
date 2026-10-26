---
id: 92
title: Export an instance to native formats without secrets
type: feature
priority: P0
effort: S
model: sonnet
area: [export]
story: US37
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [91, 55, 135]
created: 2026-10-25
---

Exports a `printer_instance` in the native shapes with the `connection` credentials left out.

**Code:** `vsslicer/modules/profiles/src/application/instances/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Exported Prusa, Orca and Cura files for an instance with a known credential do not contain the credential or the `secret_ref`
- [ ] Host and URL are kept where the native format has a field for them

## Tasks

- [ ] Write the strip rule
- [ ] Tests

## Progress

Not started.
