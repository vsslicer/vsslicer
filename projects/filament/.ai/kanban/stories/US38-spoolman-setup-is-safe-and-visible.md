---
id: US38
title: "Spoolman setup is safe and visible"
status: reviewed
epic: VSS:E45
---

As a user, I want a URL setting with a warning for non-private addresses, sync off by default, a status item and a conflict list, so that I know what sync is doing.

## Acceptance criteria

- [ ] Sync is off by default; a URL that is not private or loopback shows a warning because Spoolman has no authentication
- [ ] A status bar item shows sync state; the conflict list is visible in the inventory view; every push is logged in the output channel

## Out of scope

- Authentication
