---
id: US37
title: "A user's credentials never land in files or exports"
status: reviewed
epic: VSS:E16
---

A user keeps profiles in git; no credential and no account id can end up in the workspace, global storage or any exported file.

## Acceptance criteria

- [ ] The scan test over workspace, `globalStorageUri` and every exported file finds zero hits for known credentials, and fails when a leak is injected
- [ ] Instance export to native formats omits connection credentials and `secret_ref`

## Out of scope

- Encrypting profile files.
