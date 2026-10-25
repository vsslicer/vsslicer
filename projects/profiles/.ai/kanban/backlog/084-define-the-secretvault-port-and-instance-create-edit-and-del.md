---
id: 84
title: "Define the SecretVault port and instance create, edit and delete use cases"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US34
milestone: "VSS:M2"
depends_on: [136, 47]
created: 2026-10-25
---

Instance lifecycle in the store with a `SecretVault` port (VS Code SecretStorage and an in-memory fake are its two sides); deleting an instance deletes its secret.

**Code:** `vsslicer/modules/profiles/src/application/instances/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Create then delete an instance with the fake vault: entity and secret are both gone; a failed secret delete reports an error and keeps the entity
- [ ] A `secret_ref` is generated, opaque, and never derived from the credential
- [ ] A missing secret reports `credential-missing` for that instance, never an empty string

## Tasks

- [ ] Define the port
- [ ] Write create/edit/delete
- [ ] Tests

## Progress

Not started.
