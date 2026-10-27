---
id: 54
title: Generate the JSON Schema and fail CI on drift
type: chore
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US40
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [53]
created: 2026-10-25
---

Generates `schema/agent-protocol.schema.json` from the TypeBox definitions and checks it in; CI regenerates and fails on any difference. Path: `vsslicer/modules/common/agent-protocol/scripts/gen-schema.mjs`.

**Code:** `vsslicer/modules/common/agent-protocol/` (module: `agent-protocol`, layer: n/a (ci))

## Acceptance criteria

- [ ] `pnpm schema` writes the file deterministically (sorted keys, stable order); the file is in the published package
- [ ] `pnpm schema:check` fails when a definition changes without regenerating (verified by editing a type in a test)
- [ ] A stock JSON Schema validator (Ajv, dev dependency) accepts every valid sample and rejects every invalid sample from the core fixtures

## Tasks

- [ ] Write the generator and the check
- [ ] Add the check to the module's CI job
- [ ] Add the Ajv cross-check test

## Progress

Not started.
