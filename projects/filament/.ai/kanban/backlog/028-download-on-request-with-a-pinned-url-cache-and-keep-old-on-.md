---
id: 28
title: "Download on request with a pinned URL, cache and keep-old-on-failure"
type: feature
priority: P1
effort: M
model: sonnet
area: [import]
story: US6
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [24]
created: 2026-10-25
---

Fetch `json/all.json.gz` (pinned default, overridable), verify gzip and content type, and report failures; nothing is fetched unless asked.

**Code:** `vsslicer/modules/filament-ofd/src/adapters/...` (module: `filament-ofd`, layer: `adapters`)

## Acceptance criteria

- [ ] Offline, 404, truncated gzip and a wrong content type each return a typed error and write nothing, tested with a local HTTP fixture server
- [ ] The source revision and date of a successful download are returned with the bytes
- [ ] Nothing is requested at construction time (test)

## Tasks

- [ ] Write the downloader
- [ ] Local fixture server tests

## Progress

Not started.
