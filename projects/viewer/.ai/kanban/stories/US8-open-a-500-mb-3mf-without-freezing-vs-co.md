---
id: US8
title: "Open a 500 MB 3MF without freezing VS Code"
status: reviewed
epic: VSS:E8
---

As a user with a large project, I want the 3MF opened in a worker, so that the editor stays responsive however big the file is.

## Acceptance criteria

- [ ] Unzip and XML parsing run in a `worker_threads` worker in the extension host and in a Web Worker in the webview, with the same library code
- [ ] Reading a 500 MB fixture never blocks the extension-host thread for more than 50 ms (measured)
- [ ] A worker crash is caught and reported per file; it cannot take down the extension host
- [ ] Verified only on fixtures (D5)

## Out of scope

- Streaming viewer rendering (E10)
