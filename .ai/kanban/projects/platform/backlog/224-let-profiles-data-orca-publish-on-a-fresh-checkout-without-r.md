---
id: 224
title: Let profiles-data-orca publish on a fresh checkout without .reference
type: bug
priority: P0
effort: S
model: opus
sprint: "VSS:SP14"
created: 2026-10-27
---

Found by PLT-215 (2026-10-27). `profiles-data-orca`'s prepack regenerates its data from the upstream Orca/Bambu profile repos (PRF-190). Two problems:

1. `regenerate.mjs`'s `defaultRepos` points one directory too shallow (`vsslicer/.reference/repos` instead of the repository root's `.reference/repos`); local publishes only work with `VSS_PROFILE_REPOS` set by hand.
2. A GitHub CI checkout has no `.reference` at all (it's ignored), so publishing this module there can't regenerate its data.

Module: `profiles/data-orca` (`@vsslicer/profiles-data-orca`), layer: build/tooling.

Decide and implement: in CI, fetch the pinned upstream repos at their recorded commits (shallow clone of exact commits, read as data, no scripts run: research rules), or skip publishing this module when its version is already on the registry and only build when it changes. Fix the path either way. Version bump if published files change.

Done when: `node scripts/run.mjs ci` publishes `profiles-data-orca` on a clean checkout with no `.reference` and no `VSS_PROFILE_REPOS`, locally and on all three GitHub CI runners.