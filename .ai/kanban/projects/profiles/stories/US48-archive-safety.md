---
id: US48
title: "A malicious bundle cannot write outside the store or exhaust memory"
status: reviewed
epic: VSS:E18
---

A user dropping an untrusted archive is protected from path traversal, zip bombs and symlinks.

## Acceptance criteria

- [ ] Path traversal, absolute paths, zip bomb, symlink and 10 000 entries are rejected with a message and write nothing
- [ ] Entry-count and size limits have tests at the limit and one over

## Out of scope

- Scanning archive contents for malware.
