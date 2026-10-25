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

- [x] Candidate table in `.reference/notes/PRN-1-*.md` with repository, licence, last commit, language, transports covered, H2C support, for every candidate found
- [x] Proposed decision `decisions/D<n>-bambu-networking-implementation.md` on the VSS board with the choice, the dependency mode (depend, port under D2, re-implement) and alternatives
- [x] Chosen revision shallow-cloned into `.reference/repos/` and its commit recorded in the note
- [x] Cloud-mode capability of the choice stated so the owner can decide on it separately

## Tasks

- [x] Search and list candidates
- [x] Read each licence file and README; record transports and models
- [x] Compare against E21 scope (MQTT/TLS 8883, FTPS 990, .gcode.3mf send, AMS mapping, HMS) and E38 camera needs
- [x] Write the decision and the note

## Progress

2026-10-25 (w-prn1): identified ClusterM/open-bamboo-networking (AGPL-3.0-or-later, C++, drop-in for
`libbambu_networking`), cloned at `922c3e9` into `.reference/repos/open-bamboo-networking`. Candidate
table (12 candidates) in `.reference/notes/PRN-1-bambu-networking.md`; proposed decision
`.ai/kanban/decisions/D16-bambu-networking-implementation.md` (port the LAN protocol under D2, no
dependency, no secrets/signing code; cloud mode stated separately for the owner); summary in
`docs/research/bambu-connectivity.md` §6. Left for the owner: accept D16 and pick the cloud option.
