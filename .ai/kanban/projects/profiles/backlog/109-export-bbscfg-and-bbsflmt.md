---
id: 109
title: Export .bbscfg and .bbsflmt
type: feature
priority: P1
effort: M
model: sonnet
area: [export]
story: US44
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [108, 53, 135]
created: 2026-10-25
---

Writes Bambu Studio bundles without secrets.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/bundles/bambu/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] `import(export(x))` equals x for both extensions; unmodified fixtures re-export byte-equivalently where the format allows
- [ ] No credentials or account ids in the output

## Tasks

- [ ] Write the writer
- [ ] Round-trip tests

## Progress

Not started.
