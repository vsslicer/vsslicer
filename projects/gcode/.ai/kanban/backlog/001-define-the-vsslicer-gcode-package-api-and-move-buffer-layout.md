---
id: 1
title: Define the @vsslicer/gcode package API and move-buffer layout
type: feature
priority: P0
effort: M
model: opus
area: [parser]
story: US1
milestone: "VSS:M1"
created: 2026-10-25
---

The data contract every other epic reads: ParsedFile, Chunk, move buffer (about 28 bytes per move), layer table, diagnostics.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [ ] Types for `parse(source, opts) -> AsyncIterable<Chunk>` and `ParsedFile` compile and are exported; a type-level test pins the field list
- [ ] Buffer layout is f32x3 position, f16 width and height, u8 role, tool and flags, u32 file offset, f32 start time, and a unit test asserts the byte size per move
- [ ] Diagnostic type carries a code, severity and file offset

## Tasks

- [ ] Read the E3 scope and D2 provenance rule
- [ ] Write the types and the layout constants with a doc comment per field
- [ ] Add the type tests
- [ ] Note the layout in the package README

## Progress

Not started.
