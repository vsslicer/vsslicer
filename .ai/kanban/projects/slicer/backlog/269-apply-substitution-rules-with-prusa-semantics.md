---
id: 269
title: Apply substitution rules with Prusa semantics
type: feature
priority: P2
effort: L
model: opus
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [265, 266, 267]
created: 2026-10-25
---

Translates each rule to a JavaScript `RegExp` per the RX1 table and applies the rules in order to G-code text; written new, with Prusa's tests as vectors (AGPL-3.0, D2).

**Code:** `vsslicer/modules/slicer-extension/src/domain/...` (module: `slicer-extension`, layer: `domain`)

## Acceptance criteria

- [ ] All collected vectors produce the expected output; flags `i`, `w`, `m`, `s` each have a test
- [ ] An invalid pattern fails with the rule's index and text; an unsupported construct fails loudly with the message from RX1 (never skipped)
- [ ] Applying the same rules twice differs only where the rules are not idempotent (documented test)
- [ ] A 100 MB input is processed line by line or in chunks without loading it whole (heap test)

## Tasks

- [ ] Pattern translation
- [ ] Flag handling
- [ ] Streaming application
- [ ] Vector tests

## Progress

Not started.
