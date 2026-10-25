---
id: US10
title: "Importing the full catalogue keeps the editor responsive and credits its sources"
status: reviewed
epic: VSS:E41
---

As a user, I want the 15,000-variant import to run off the extension host and the data sources credited, so that VS Code stays responsive and the MIT attributions are honoured.

## Acceptance criteria

- [ ] Import of the full current OFD bulk file runs in a `worker_threads` worker and blocks the host for no more than 50 ms at a time (measured)
- [ ] OFD and SpoolmanDB attribution is in the third-party notices and in each record's source field
- [ ] Memory peak of the worker is recorded; the `all.ndjson` stream is the documented fallback

## Out of scope

- Bundling the data
