---
id: 225
title: Keep the OctoPrint user name on imported Orca printer instances
type: bug
priority: P2
effort: S
model: sonnet
area: [importers]
sprint: "VSS:SP13"
depends_on: [90]
created: 2026-10-26
---

Found by sp12-rev-prf-90: `readOrcaInstances` drops Orca's `printhost_user` because the printer-instance entity has no field for it, so a user-auth OctoPrint instance gets the password without the user name (digest auth needs both).

**Code:** `vsslicer/modules/profiles-orca/src/adapters/instances/read-instances.ts` and the instance entity in profile-api if it needs a field (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] An imported instance keeps the user name next to the credential reference, with a test on a preset holding `printhost_user`
- [ ] **Bounds:** the user name has a length cap, tested at the cap and cap plus one

## Progress

Not started.
