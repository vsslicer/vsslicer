---
id: 18
title: Store printer secrets in SecretStorage and keep them out of settings and logs
type: feature
priority: P0
effort: S
model: opus
area: [api]
story: US4
milestone: "VSS:M3"
depends_on: [15, 14]
created: 2026-10-25
---

The `SecretStore` implementation over `context.secrets`, with the leak test as the regression guard.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A `SecretStorage`-backed `SecretStore`; a missing secret gives 'credential missing' with a re-enter action, never an empty password sent
- [ ] Test greps the settings file, `globalStorageUri` and the output channel after adding a printer with a known secret: zero hits
- [ ] Deleting a printer deletes its secret

## Tasks

- [ ] Write the store
- [ ] Leak-scan test
- [ ] Missing-secret path

## Progress

Not started.
