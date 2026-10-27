---
id: 52
title: Add the method and notification definition DSL with namespaced registry and version rule
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US40
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [51]
created: 2026-10-25
---

`defineMethod` and `defineNotification` over TypeBox giving params and result types and schemas, a namespace registry other modules extend (`printer.*`, `camera.*`, `job.*`), and the protocol version with its major-compatible rule.

**Code:** `vsslicer/modules/common/agent-protocol/src/domain/...` (module: `agent-protocol`, layer: `domain`)

## Acceptance criteria

- [ ] A defined method exposes `Static` types for params and result and its JSON Schema; duplicate method names throw
- [ ] Registering a namespace from outside the module requires only the DSL (a test registers `printer.status` from a test file); a method outside a registered namespace is rejected
- [ ] `isCompatible(clientVersion, serverVersion)` is true only for equal majors; table-driven test including pre-1.0 handling documented

## Tasks

- [ ] Implement DSL and registry
- [ ] Implement version parsing and compatibility
- [ ] Unit tests

## Progress

Not started.
