---
id: US70
title: "Trust Prusa slicing in CI on three systems"
status: reviewed
epic: VSS:E65
---

As a maintainer, I want the Prusa fixtures sliced in CI on Linux, macOS and Windows, so that regressions show before release.

## Acceptance criteria

- [ ] Fixture slices on the pinned 2.9.x run in CI on three platforms; the parser's layer count and roles match `expected.json` as in I5
- [ ] `.bgcode` and text outputs of the same slice have equal moves
- [ ] CI caches a pinned fetch of the Prusa binary and the upstream profile bundle

## Out of scope

