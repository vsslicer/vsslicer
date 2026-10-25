---
id: US15
title: "Parse model files in workers behind size and error guard rails"
status: reviewed
epic: VSS:E9
---

As a user opening a model, I want parsing off the UI and host threads with clear errors and a confirmation before huge files, so that a bad file fails politely and a huge one never surprises me.

## Acceptance criteria

- [ ] `parseStl`, `parseObj` and the BVH run in a Web Worker pool in the webview and in `worker_threads` in the extension host; results cross as transferred `ArrayBuffer`s through the E2 transport
- [ ] A configurable triangle cap (default from the E10 benchmark) makes the caller confirm; a file above the cap gives a typed error and a fixture
- [ ] A worker crash fails one file open with a message; nothing runs on the host thread
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
