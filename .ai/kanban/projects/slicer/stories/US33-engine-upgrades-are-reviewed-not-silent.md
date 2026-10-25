---
id: US33
title: "Engine upgrades are reviewed, not silent"
status: reviewed
epic: VSS:E30
---

As a maintainer, I want bumping a pinned engine version to regenerate the capability report and fail CI until I review the diff, so that engine drift is a deliberate change.

## Acceptance criteria

- [ ] Bumping a pinned engine version regenerates the report; a diff in the report fails CI until reviewed
- [ ] One effect test per row per supporting engine runs in CI against the pinned engines

## Out of scope

- Nothing beyond the epic's own Out list
