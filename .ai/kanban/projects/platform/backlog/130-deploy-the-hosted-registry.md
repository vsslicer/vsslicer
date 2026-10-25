---
id: 130
title: Deploy the hosted registry
type: feature
priority: P2
effort: L
model: opus
area: [registry]
story: US64
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [128, 124, 114, 115, 125, 129]
created: 2026-10-25
---

Runs the Compose stack on a chosen host with TLS, backups on a schedule and the production key. Blocked on a hosting budget (D5, D10): do not start until `PLT-128` records a yes for hosting. Fallback without budget: the local instance from `openvsx-registry@0.1.0` remains the only registry and the card stays in backlog.

**Code:** `vsslicer/modules/openvsx-registry/deploy/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] Budget gate: Blocked on a hosting budget (D5, D10): do not start until `PLT-128` records a yes for hosting.
- [ ] The host serves the gallery tests (PLT-117) over HTTPS from a clean machine
- [ ] A scheduled backup runs and a restore was rehearsed on the host
- [ ] The production key and OAuth secrets are set from the host secret store; nothing in git
- [ ] An owner approval for going public is recorded before DNS is switched

## Tasks

- [ ] Pick the host per the budget decision
- [ ] Deploy and run the gallery tests against it
- [ ] Schedule backups

## Progress

Not started.
