---
id: 125
title: Publish the takedown procedure and contact on the registry about page
type: docs
priority: P2
effort: S
model: sonnet
area: [registry]
story: US63
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [121, 112]
created: 2026-10-25
---

Notice-and-takedown procedure and contact (`licensing.md` section 2 (e)) shown on the registry web UI about page.

**Code:** `vsslicer/modules/tooling/openvsx-registry/docs/takedown.md` (module: `openvsx-registry`, layer: n/a (docs))

## Acceptance criteria

- [ ] The about page of the local instance shows the policy summary, the takedown procedure and the contact
- [ ] A test fetches the page and asserts the contact and procedure text
- [ ] Contact address is an env setting, not hard-coded

## Tasks

- [ ] Write the procedure
- [ ] Configure the about page content
- [ ] Add the page test

## Progress

Not started.
