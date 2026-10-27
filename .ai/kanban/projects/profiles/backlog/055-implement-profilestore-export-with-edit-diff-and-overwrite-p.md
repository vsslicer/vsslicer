---
id: 55
title: Implement ProfileStore.export with edit-diff and overwrite protection
type: feature
priority: P0
effort: M
model: opus
area: [export]
story: US23
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [44, 47, 136]
created: 2026-10-25
---

The use case that picks the registered `Exporter` for a format, exports unmodified entities as their stored native form, and refuses to overwrite without confirmation.

**Code:** `vsslicer/modules/profiles/profiles/src/application/export/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With fake exporters, an edited entity is passed to the exporter with its native form and the edited keys only; the end-to-end one-key-diff check on real files is the extension's round-trip test
- [ ] `export` to an existing path returns `needs-confirmation` and writes nothing until confirmed
- [ ] Exporting an entity whose key has no native name in the target dialect returns a diagnostic naming the key

## Tasks

- [ ] Write the dispatch and the diff behaviour
- [ ] Overwrite protection
- [ ] Edit-diff tests

## Progress

Not started.
