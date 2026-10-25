---
id: US1
title: The open-source Bambu networking implementation is identified, licensed and pinned
status: reviewed
epic: VSS:E21
---

Before any Bambu adapter code is written, the project knows which open-source implementation of
Bambu's network protocol it builds on (the owner named a "bamboo-networking plugin"), under which
licence and at which revision, and whether we depend on it, port it (D2) or re-implement from it.

## Acceptance criteria

- [ ] Candidates evaluated and recorded in `.reference/notes/`: at least ClusterM/open-bamboo-networking, baltobu, BB-Open, beambam and whatever else a search finds, each with repository, licence file text, last commit, language, transport coverage (LAN MQTT/TLS, FTPS, camera, cloud) and H2C support
- [ ] A proposed decision on the VSS board names the choice and the dependency mode, with what changes if the owner picks differently
- [ ] The chosen revision is cloned shallowly into `.reference/repos/` with its commit recorded

## Out of scope

Writing adapter code; cloud mode (needs an owner decision after this spike).
