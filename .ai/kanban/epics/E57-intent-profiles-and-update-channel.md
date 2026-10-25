---
id: E57
title: Add intent profiles and an opt-in vendor profile update channel
status: draft
initiative: I10
project: PRF
order: 9
depends_on: [E12, E13, E15]
rows: ["§13 Intent profiles over quality", "§13 Profile update channel"]
---

Two P2 profile rows for parity. Intent profiles bring Cura's intent layer (engineering, visual, quick and others) into the unified `process` as an `intent` field with overrides, so a user picks "strong" or "visual" over a quality. The update channel tells users when a vendor's profiles have a newer upstream version and applies it as a three-way change over their own edits, the way PrusaSlicer's preset updater and Orca's opt-in check do.

## Scope
- In: import of Cura `intent/*.inst.cfg` (641 files at `Cura@5bea2f8`) as process overrides with `intent`; an intent picker in the form (E15) and in SLC's process selection.
- In: an opt-in update check (off by default, like Orca's `enable_ota`): Prusa via the upstream repository's newer commit (D4) or `preset-repo-api.prusa3d.com` indices; Orca/Bambu via a new release of the data package; Cura via a newer pinned release. A snapshot before applying (as PrusaSlicer does, `PresetUpdater.cpp:176`), and a three-way view for user entities whose `meta.base_version` is older than their parent's new version.
- Out: automatic updates; maintaining our own vendor library; cloud sync (E58).

## Feature-matrix rows
- §13 Intent profiles over quality (P2): done when Cura intents import with their category counts and resolve as overrides.
- §13 Profile update channel (P2): done when a newer upstream version is detected on request and applied with a snapshot and a three-way view of user changes.

## Acceptance criteria
- [ ] Intent golden counts at `Cura@5bea2f8`: engineering 242, visual 143, quick 139, solid 70, annealing 27, strong 7, highspeed 6, highspeedsolid 6.
- [ ] Update fixture: two pinned commits of a vendor bundle; detection lists changed presets; applying keeps user diffs and flags conflicts; rollback restores the snapshot byte for byte.
- [ ] With the setting off, no network request is made (test with a blocked network).
- [ ] Fixtures only (D5).

## Dependencies
- Needs E12, E13, E15. Exposes `intent` in resolve results to E28 (CuraEngine) and E26.

## Risks and spikes
- Prusa 3.0's production update endpoint is unknown (`RepositoryManifest.json` points at localhost); spike when 3.0 ships.
- Cura intent categories other than the four in `profiles.md` §6's enum: the enum is extended to Cura's eight.

## Eng review
- Scope: about 2-3 sprints together; two rows merged because both are small and both extend import plus resolve. Split if the update channel's three-way view grows.
- Reversibility: snapshot and rollback are part of the acceptance criteria; the check is opt-in.
