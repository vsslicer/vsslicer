---
id: 204
title: "Spike: a TypeScript port on a JS Clipper2 versus a WASM build of libnest2d and Clipper2"
type: spike
priority: P1
effort: M
model: opus
area: [arrange]
story: US61
milestone: "VSS:M4"
depends_on: [203]
created: 2026-10-25
---

Compares the two port routes on the fixtures for placement quality and speed, checks whether a maintained JS Clipper2 port exists, and whether Orca's path needs NLopt rotation optimisation. A WASM build spends an innovation token, so it must earn it.

**Code:** `vsslicer/modules/arrange/docs/port-route-spike.md` (module: `arrange`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] Utilisation and time on the 50 and 200 fixtures are recorded for both routes
- [ ] The licence of the chosen Clipper2 port or build is recorded
- [ ] A fixed rotation candidate set is chosen if NLopt is needed, and the decision is written down
- [ ] The recommendation names the route the following cards use

## Tasks

- [ ] Find the JS port
- [ ] Prototype both routes
- [ ] Measure
- [ ] Write the decision

## Progress

Not started.
