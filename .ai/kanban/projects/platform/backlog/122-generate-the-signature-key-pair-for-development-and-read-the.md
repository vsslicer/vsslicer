---
id: 122
title: Generate the signature key pair for development and read the production key from a secret
type: feature
priority: P2
effort: M
model: opus
area: [registry]
story: US62
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [112]
created: 2026-10-25
---

Handles the `ovsx.integrity.key-pair` material: a script generates a development pair (gitignored), production reads a secret; security-sensitive so no key is logged or committed.

**Code:** `vsslicer/modules/tooling/openvsx-registry/src/adapters/keys.ts` (module: `openvsx-registry`, layer: `adapters`)

## Acceptance criteria

- [ ] The script creates a key pair outside git; the repository secret scan finds nothing
- [ ] The server refuses to start with the production profile when no key is supplied (named error)
- [ ] Rotation steps are written in `docs/keys.md` and a test rotates the dev key and verifies new uploads only

## Tasks

- [ ] Write the key script and the profile switch
- [ ] Write the rotation notes and test

## Progress

Not started.
