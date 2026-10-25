---
id: 124
title: Back up and restore the database and storage with a rehearsal test
type: feature
priority: P2
effort: M
model: sonnet
area: [registry]
story: US63
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [112]
created: 2026-10-25
---

Backup and restore scripts for PostgreSQL and the storage volume, rehearsed into an empty instance.

**Code:** `vsslicer/modules/openvsx-registry/scripts/` (module: `openvsx-registry`, layer: `adapters`)

## Acceptance criteria

- [ ] `backup.sh` writes one archive of the database dump and storage; `restore.sh` restores it into an empty instance
- [ ] After restore the instance serves the same extensions and versions (checked by listing and by downloading one VSIX hash)
- [ ] The rehearsal is recorded in `docs/backup-rehearsal.md` with date and sizes

## Tasks

- [ ] Write the scripts
- [ ] Write the rehearsal test
- [ ] Record the rehearsal

## Progress

Not started.
