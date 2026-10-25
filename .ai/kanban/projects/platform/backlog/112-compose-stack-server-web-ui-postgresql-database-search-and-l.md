---
id: 112
title: "Compose stack: server, web UI, PostgreSQL, database search and local-disk storage"
type: feature
priority: P2
effort: M
model: sonnet
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [111]
created: 2026-10-25
---

Delivers `docker compose up` for the registry on a developer machine or a CI runner with the settings the spike found.

**Code:** `vsslicer/modules/openvsx-registry/compose/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] `docker compose up` from a clean checkout yields a healthy server and web UI; a health script in `test/` waits for readiness and fails with the container log tail on timeout
- [ ] Data survives `docker compose restart` (PostgreSQL and storage volumes)
- [ ] Configuration is environment-driven; no secret is in the repository (scan passes)
- [ ] Verified on a local instance in CI; no hardware

## Tasks

- [ ] Write `compose/docker-compose.yml` and the env template
- [ ] Add the readiness script and CI job
- [ ] Write the quick-start in the module README

## Progress

Not started.
