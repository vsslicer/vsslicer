---
id: US34
title: "Import my existing Spoolman once"
status: reviewed
epic: VSS:E45
---

As a user who already runs Spoolman, I want a one-shot import from the instance or its `/export` files, so that my inventory starts populated.

## Acceptance criteria

- [ ] Spoolman REST contract tests (import, create, edit, `use`, `measure`, delete, websocket events) pass against Spoolman in Docker in CI, image tag pinned and recorded
- [ ] The first sync is a dry run with a summary the user confirms
- [ ] Mapping round trip: export to Spoolman and import into an empty store keeps superset fields through `extra`

## Out of scope

- Spoolman as the store of record, label designer, QR scanning, `/tag/scan` relay
