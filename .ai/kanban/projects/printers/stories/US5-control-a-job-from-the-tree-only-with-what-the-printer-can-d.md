---
id: US5
title: "A user starts, pauses, resumes and cancels a job from the tree, offered only what the printer can do"
status: reviewed
epic: VSS:E20
---

As a printer owner, I want start, pause, resume and cancel commands that appear only when the printer's adapter has the capability, and a clear result when a call fails, so that I never click a button that cannot work and never get a silent failure.

## Acceptance criteria

- [ ] A job command on an adapter without the capability is hidden, not failing (`@vscode/test-electron` test with the fake adapter)
- [ ] Every `PrinterError` kind (`auth`, `unreachable`, `timeout`, `refused`, `busy`, `unsupported`, `protocol`, `fileRejected`) has a user-visible result (notification or tree item state) and a test
- [ ] Tree view and commands are verified in an `@vscode/test-electron` integration test with the fake adapter

## Out of scope

- Real printers; fleet-wide commands.
