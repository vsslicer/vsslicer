---
id: 85
title: Implement SecretVault over VS Code SecretStorage
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US35
milestone: "VSS:M2"
sprint: "VSS:SP21"
depends_on: [144, 57]
created: 2026-10-25
---

The VS Code side of the vault, using `context.secrets` under the `secret_ref`; security-sensitive.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/secrets/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Store, read and delete round-trip in an `@vscode/test-electron` run; the credential is not in any file under the workspace or `globalStorageUri` after storing (scan)
- [ ] A keychain failure surfaces a named error and is not retried silently
- [ ] The adapter never logs a credential (log capture test)

## Tasks

- [ ] Write the adapter
- [ ] Scan and log tests

## Progress

Not started.
