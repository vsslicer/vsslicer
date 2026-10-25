---
id: US69
title: "Keep working when STEP is unavailable or fails"
status: reviewed
epic: VSS:E37
---

As a user, I want clear messages when a STEP import cannot run or fails, and a working editor without STEP support, so that a broken or missing converter never blocks the rest.

## Acceptance criteria

- [ ] Each error class has a fixture and a message: unsupported schema, empty file, WASM load failure (for example a CSP block or a missing file), out-of-memory in the worker
- [ ] A 50 MB STEP file imports in a worker with progress and cancel and never blocks the extension host or the webview UI thread
- [ ] The extension works with the WASM file absent: STEP is then reported unavailable
- [ ] Verified only on fixtures (D5)

## Out of scope

- Retrying with a different converter
