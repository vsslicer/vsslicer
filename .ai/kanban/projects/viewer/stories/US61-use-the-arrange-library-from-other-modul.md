---
id: US61
title: "Use the arrange library from other modules"
status: reviewed
epic: VSS:E35
---

As the author of the slicer extension or the fleet queue, I want arrange as a small standalone library with plain polygon inputs, so that I can pack a plate or a queue without the editor or VS Code.

## Acceptance criteria

- [ ] `@vsslicer/arrange` installs and tests alone with no VS Code and no `mesh` dependency; inputs are vertex arrays with transforms and a bed description
- [ ] The entry points `arrange`, `fillBed` and `multiply` run in a worker with progress and cancel
- [ ] Ported code carries notices and `Ported from` lines for `OrcaSlicer@09aa0114:src/libslic3r/Arrange.cpp`, `ModelArrange.cpp` and `deps_src/libnest2d`
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything that touches a project file
