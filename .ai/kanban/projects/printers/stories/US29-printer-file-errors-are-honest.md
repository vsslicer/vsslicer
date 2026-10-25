---
id: US29
title: "Printer file operations fail honestly: read-only, unreachable, too big"
status: reviewed
epic: VSS:E24
---

As a user, I want a printer that cannot write to show as read-only, an unreachable printer to say so, and a big download to ask first, so that the Explorer never hangs or lies.

## Acceptance criteria

- [ ] Read-only adapters give `FileSystemError.NoPermissions`; an unreachable printer gives `Unavailable`; every provider call has a timeout
- [ ] `readFile` above a size limit prompts, and offers 'download to folder' streaming instead of buffering

## Out of scope

- Resumable downloads.
