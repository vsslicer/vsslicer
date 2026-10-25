---
id: US90
title: "Use cut and boolean safely: WASM, refusals, cancel and limits"
status: reviewed
epic: VSS:E53
---

As a user, I want cut and boolean to stay out of the way until I use them and to fail with a clear message, so that a bad mesh or a missing file never corrupts my project.

## Acceptance criteria

- [ ] The manifold-3d WASM is a separate asset in the VSIX, loaded only when a tool runs; without it the tools are disabled with a message and the rest works
- [ ] Non-manifold input is refused instead of producing undefined results
- [ ] Work runs in a worker with cancel and a memory cap; the host stays responsive
- [ ] Random planes and operand pairs always give closed manifold results or a refusal (property test)
- [ ] The WASM size, load time and peak memory on the largest fixture are recorded
- [ ] Verified only on fixtures (D5)

## Out of scope

- Building manifold-3d ourselves
