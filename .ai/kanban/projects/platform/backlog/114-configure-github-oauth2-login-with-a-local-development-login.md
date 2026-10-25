---
id: 114
title: Configure GitHub OAuth2 login with a local development login
type: feature
priority: P2
effort: S
model: sonnet
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [112]
created: 2026-10-25
---

Sets up GitHub OAuth2 for publishers (free) and a clearly-marked local development login for CI and offline work.

**Code:** `vsslicer/modules/openvsx-registry/compose/` and `scripts/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] Production login uses a GitHub OAuth2 app configured from env/secrets; the template names every required variable
- [ ] A local development mode logs in a fixture user and is refused when the registry URL is not localhost (test)
- [ ] Publishing tokens for the CI user are created by a script, not by hand

## Tasks

- [ ] Add OAuth2 settings and the local-only dev login
- [ ] Add the token script and tests

## Progress

Not started.
