---
id: 123
title: "Merge, dedupe and probe discovery results"
type: feature
priority: P1
effort: M
model: sonnet
area: [discovery]
story: US23
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [121, 122]
created: 2026-10-25
---

A discovery service that merges discoverers, dedupes by host, and probes each through the registered adapters' `probe` before offering it.

**Code:** `vsslicer/modules/printer-discovery/src/application/...` (module: `printer-discovery`, layer: `application`)

## Acceptance criteria

- [ ] A host answering both mDNS and SSDP appears once; an unprobeable host is dropped or marked unknown (test); probe timeouts do not block the list
- [ ] Two real sides today: the discoverers and the adapter probes (fakes in tests)

## Tasks

- [ ] Service
- [ ] Probe step
- [ ] Tests

## Progress

Not started.
