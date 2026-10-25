---
id: US55
title: "See only the commands that work on the web"
status: reviewed
epic: VSS:E48
---

As a web user, I want printer, slice and live-follow commands to be absent from the command palette and menus, with a one-line explanation where I would expect them, so that I am not offered things that cannot work.

## Acceptance criteria

- [ ] A tooling check asserts that every command marked desktop-only in an extension's manifest carries `!isWeb` in its command palette and menu `when` clauses
- [ ] The preview's and the viewer's own web tests assert the contributed `when` clauses
- [ ] Where a user would look for a hidden feature (for example the follow button), a one-line message says it needs the desktop

## Out of scope

- Hiding features on desktop.
