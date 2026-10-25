---
id: US4
title: "Get a clear message for every engine failure"
status: reviewed
epic: VSS:E26
---

As a user, I want every way the engine can fail to produce a specific message, and a crash or hang never to freeze VS Code, so that I know what to fix.

## Acceptance criteria

- [ ] Every row of the Orca exit-code table (`OrcaSlicer@09aa0114:src/libslic3r/Utils.hpp:43-95`, read as a signed byte) maps to a typed error with a user-visible message; one test per code with a stub binary that exits with it
- [ ] A new code or a modulo-256 wrap shows as an explicit unknown-error, never as success (regression test)
- [ ] A crash (signal) or a timeout produces an error notification and does not block the extension host (integration test with `@vscode/test-electron`)
- [ ] The timeout is a setting; a hung engine is killed when it expires

## Out of scope

- Cura error codes (US16)
