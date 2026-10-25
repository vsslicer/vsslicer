---
id: US6
title: "Parse 500 MB inside the memory budget and record the numbers"
status: reviewed
epic: VSS:E3
---

As the maintainer, I want the moves-per-byte question answered and memory and throughput measured in CI, so the 28 bytes per move budget is a tested fact and not a hope.

## Acceptance criteria

- [ ] Synthetic 50, 200 and 500 MB files parse in a worker at or under 28 bytes per move; peak worker RSS is recorded in CI
- [ ] Throughput is recorded per file size
- [ ] The moves-per-byte spike result is recorded as a decision (proposed on the VSS board)

## Out of scope

- Level-of-detail merging (an E5 spike only if the decision says it is needed)
