---
id: US21
title: "Know when a script failed or was skipped, and stay safe"
status: reviewed
epic: VSS:E29
---

As a user, I want a failing script to stop the slice and name itself, and untrusted projects never to run code, so that a bad script cannot ship a bad file or hurt my machine.

## Acceptance criteria

- [ ] A non-zero exit, a timeout, or a script that deletes its input each produce a task failure naming the script; the unprocessed G-code is kept in the temp directory and nothing is moved into `.vsslicer/sliced/`
- [ ] In an untrusted workspace scripts are not run and the task output says why
- [ ] A `post_process` embedded in a 3MF's config is shown and needs explicit confirmation; it is never taken silently
- [ ] Post-processing can be disabled per workspace

## Out of scope

- Sandboxing scripts beyond Workspace Trust
