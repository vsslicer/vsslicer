---
id: US24
title: "Edit a spool in an accessible form"
status: reviewed
epic: VSS:E43
---

As a user, I want one form for initial weight, empty spool weight, location, lot, price, extras and archive, so that I can maintain a spool without hand-editing files.

## Acceptance criteria

- [ ] The form's webview passes the CSP helper's policy test and an axe accessibility check; fields have labels and keyboard navigation
- [ ] Invalid input (negative weight, empty spool heavier than gross) is rejected with a message
- [ ] Writes go through `Inventory`; an unsaved form is kept as a draft in webview state

## Out of scope

- A custom editor for the store file
