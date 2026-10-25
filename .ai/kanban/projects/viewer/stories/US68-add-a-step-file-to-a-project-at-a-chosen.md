---
id: US68
title: "Add a STEP file to a project at a chosen quality"
status: reviewed
epic: VSS:E37
---

As a user preparing a plate, I want to add a STEP file to the project, pick the tessellation quality with a preview of the triangle count, and choose whether each solid becomes an object or a part, so that CAD parts join the plate like any mesh.

## Acceptance criteria

- [ ] `Add STEP to project` imports the file with a quality setting (linear and angular deflection); changing quality changes the triangle count monotonically and the previewed count matches the result
- [ ] Each STEP solid becomes a part or an object by the user's choice; names come from the STEP product names
- [ ] The source path is recorded in the VSSlicer namespace so the user can add it again; the 3MF stores the mesh
- [ ] The resulting project slices with the Orca CLI
- [ ] Verified only on fixtures (D5)

## Out of scope

- Keeping the B-rep for re-tessellation after save
