---
id: US33
title: "The form is fast, accessible and never loses an edit silently"
status: reviewed
epic: VSS:E15
---

A user with a keyboard, a screen reader or a slow machine edits large profiles reliably.

## Acceptance criteria

- [ ] A process with every catalogue key set renders within 500 ms in the webview test harness (virtualised list)
- [ ] A keyboard-only walk through a page and search reaches every control; an axe-core pass reports no violations
- [ ] A forced host restart shows a banner and reloads; a stale version or save error is shown on the field and no edit is dropped silently
- [ ] Fixtures only (D5)

## Out of scope

- Mobile layouts.
