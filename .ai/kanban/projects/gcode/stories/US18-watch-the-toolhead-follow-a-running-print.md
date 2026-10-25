---
id: US18
title: "Watch the toolhead follow a running print"
status: reviewed
epic: VSS:E7
---

As a user following a print, I want the preview to track the printed position, dim what is not printed, let me break out and rejoin, and stop with a message when the feed is stale or the file differs from the printer's.

## Acceptance criteria

- [ ] Follow mode tracks the position, dims the part above it, and the user can break out and rejoin
- [ ] Stale feed (no update for a set time) and file mismatch (size or MD5) stop follow with a message, each tested
- [ ] Out-of-range positions give a message and a test
- [ ] Live H2C follow happens only once PRN's feed exists (I4); in I1 fixtures only

## Out of scope

- Camera overlay (I7), time remaining from live progress
