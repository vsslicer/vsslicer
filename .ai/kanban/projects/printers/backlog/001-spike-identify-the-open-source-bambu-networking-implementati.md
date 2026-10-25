---
id: 1
title: "Spike: identify the open-source Bambu networking implementation"
type: spike
priority: P0
effort: M
model: opus
area: [bambu]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP3"
created: 2026-10-25
---

Identify the open-source Bambu networking implementation the owner named, its licence and revision, and decide depend, port or re-implement.

## Acceptance criteria

- [ ] Candidate table in `.reference/notes/PRN-1-*.md` with repository, licence, last commit, language, transports covered, H2C support, for every candidate found
- [ ] Proposed decision `decisions/D<n>-bambu-networking-implementation.md` on the VSS board with the choice, the dependency mode (depend, port under D2, re-implement) and alternatives
- [ ] Chosen revision shallow-cloned into `.reference/repos/` and its commit recorded in the note
- [ ] Cloud-mode capability of the choice stated so the owner can decide on it separately

## Tasks

- [ ] Search and list candidates
- [ ] Read each licence file and README; record transports and models
- [ ] Compare against E21 scope (MQTT/TLS 8883, FTPS 990, .gcode.3mf send, AMS mapping, HMS) and E38 camera needs
- [ ] Write the decision and the note

## Progress

Not started.
