---
id: 148
title: Define vendor versions and the UpdateSource port
type: feature
priority: P2
effort: S
model: sonnet
area: [schema]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [136]
created: 2026-10-25
---

Types shared by the core and the three format adapters: `VendorVersion` (ecosystem, vendor, opaque version id such as a commit, index version or release tag, optional date), and the `UpdateSource` port with `latest(vendor, signal)` and `stage(version, folder, progress, signal)` that downloads a version into a staging folder and returns it for the registered importer to read.

**Code:** `vsslicer/modules/profile-api/src/application/...` (module: `profile-api`, layer: `application`)

## Acceptance criteria

- [ ] Types only; a type test fails when a member is removed; a fake source with the two members compiles
- [ ] A source never writes outside the folder it is given (stated in the port's doc and checked by each adapter's tests)
- [ ] No network or file-system import in the module (lint)

## Tasks

- [ ] Types
- [ ] Port
- [ ] Type tests

## Progress

Not started.
