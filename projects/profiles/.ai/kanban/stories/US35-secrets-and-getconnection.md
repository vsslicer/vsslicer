---
id: US35
title: "A printer extension obtains a credential only through SecretStorage"
status: reviewed
epic: VSS:E16
---

A printer extension calls `getConnection(instanceId)` and receives host, URL and credential, while the credential never exists in a profile file.

## Acceptance criteria

- [ ] The credential is stored with `context.secrets` under the `secret_ref`; no log contains it
- [ ] `getConnection` returns the credential only when the caller names the instance's host type; a missing credential gives `credential-missing` with a re-enter action, never an empty password
- [ ] Remote-SSH behaviour is recorded by the spike

## Out of scope

- Adapter registration (E20).
