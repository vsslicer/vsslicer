---
id: 201
title: Open a fixture workspace in test-vscode so suites can test workspaceContains activation
type: chore
priority: P2
effort: S
model: sonnet
milestone: "VSS:M4"
sprint: "VSS:SP33"
created: 2026-10-26
---

From PRF-57's review (SP10): `@vsslicer/test-vscode` (`dist/run.js:42`) opens no workspace folder, so no extension's integration suite can show that a `workspaceContains:` activation event works; the suites call `ext.activate()` themselves.

**Code:** `vsslicer/modules/tooling/test-vscode` (adapters), then `profiles-extension` integration test (presentation)

## Acceptance criteria

- [ ] `test-vscode` takes an optional fixture workspace folder and opens it in the test instance
- [ ] profiles-extension's integration suite opens a fixture with `.vsslicer/profiles/` and asserts `ext.isActive` before any `activate()` call; removing the `workspaceContains` event from its manifest fails the suite
- [ ] test-vscode release (patch or minor per rule 13) and re-lock of the extensions that use it

## Progress

Not started.
