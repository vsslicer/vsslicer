---
id: 12
title: Write the bundled-dependency licence check and THIRD-PARTY-NOTICES generator
type: feature
priority: P1
effort: M
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [11, 3]
created: 2026-10-25
---

Walks each extension's bundled production dependencies (from the esbuild metafile), fails on a licence outside the allow-list (AGPL-3.0, GPL-3.0, LGPL-2.1/3.0, MIT, BSD-2/3, ISC, Apache-2.0, MPL-2.0, CC0, Zlib), and writes `THIRD-PARTY-NOTICES.md` per extension.

## Acceptance criteria

- [ ] A fixture dependency marked `UNLICENSED` fails the check
- [ ] A fixture dependency with a non-allow-listed licence fails
- [ ] The sample extension's `THIRD-PARTY-NOTICES.md` lists every bundled dependency with licence text; output is deterministic
- [ ] Dual-licence expressions (`MIT OR GPL-3.0`) are evaluated against the allow-list

## Tasks

- [ ] Read the esbuild metafile and resolve package licences
- [ ] Implement allow-list and SPDX expression handling
- [ ] Generate the notices file
- [ ] Add failing fixtures and tests

## Progress

Not started.
