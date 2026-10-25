---
id: 12
title: Port the Heatshrink 11-4 and 12-4 decoder
type: feature
priority: P0
effort: M
model: sonnet
area: [bgcode]
story: US4
milestone: "VSS:M1"
depends_on: [11]
created: 2026-10-25
---

Compression used by `.bgcode` blocks, ported from libbgcode `binarize/`.

## Acceptance criteria

- [ ] Vectors taken from fixtures decode to the expected bytes for 11-4 and 12-4
- [ ] A corrupted stream fails with a diagnostic and terminates (timeout test)

## Tasks

- [ ] Port decoder
- [ ] Extract vectors from fixtures
- [ ] Corruption test

## Progress

Not started.
