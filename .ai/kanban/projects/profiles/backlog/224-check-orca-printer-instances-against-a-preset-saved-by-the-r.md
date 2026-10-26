---
id: 224
title: Check Orca printer instances against a preset saved by the real app
type: chore
priority: P2
effort: S
model: sonnet
area: [importers]
sprint: "VSS:SP29"
depends_on: [90]
created: 2026-10-26
---

PRF-90 found from OrcaSlicer's source that host and credential keys (`print_host`, `host_type`, `printhost_apikey`, `printhost_password`) live in the user machine preset JSON, and tested on invented presets: no preset with a print host saved by the real app exists on this machine. Waits on the owner's answer to the question asked on PRF-90.

**Code:** `vsslicer/modules/profiles-orca/test/fixtures/instances/orca-saved/` (module: `profiles-orca`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] A user machine preset with a print host, saved by OrcaSlicer 2.x (version recorded, credential redacted), is checked in with its provenance
- [ ] `readOrcaInstances` reads it into an instance with model, nozzle and host, and the note in PRF-90 is confirmed or corrected

## Progress

Not started.
