---
id: US64
title: "Apply a vendor update over my edits with a snapshot, a three-way view and rollback"
status: reviewed
epic: VSS:E57
---

As a user with edited profiles, I want to apply a vendor update without losing my changes, see where my edits and the vendor's changes collide, and roll back if I dislike the result, so that updating is safe.

## Acceptance criteria

- [ ] A snapshot of the vendor tree and user files is taken before applying; rollback restores it byte for byte
- [ ] User entities whose `meta.base_version` is older than the parent's new version are rebased as a three-way change: my changes kept, vendor changes taken, conflicts flagged and left untouched until I choose
- [ ] The update fixture of two pinned commits of a vendor bundle shows detection, apply and rollback end to end
- [ ] A crash mid-apply leaves the old state intact (fault-injection test)

## Out of scope

- Merging two user edits; undo beyond the snapshot.
