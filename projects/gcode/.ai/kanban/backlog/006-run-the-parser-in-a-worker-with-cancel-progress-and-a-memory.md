---
id: 6
title: "Run the parser in a worker with cancel, progress and a memory cap"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
depends_on: [5]
created: 2026-10-25
---

A parser crash or out-of-memory error must stay out of the extension host.

## Acceptance criteria

- [ ] A `worker_threads` host parses the corpus and returns the same results as in-process
- [ ] Cancel stops a 200 MB synthetic parse within 500 ms (test)
- [ ] Progress events arrive; exceeding the memory cap gives a typed error in the host (test)
- [ ] The host never parses on its own thread

## Tasks

- [ ] Worker entry and host wrapper
- [ ] Cancel and progress messages
- [ ] Memory cap via resourceLimits and typed errors

## Progress

Not started.
