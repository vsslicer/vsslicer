---
id: US40
title: "A protocol author defines methods and notifications once and gets types, validation and a checked-in JSON Schema"
status: reviewed
epic: VSS:E19
---

As a PRN or PLT developer adding a method to the agent protocol, I want to declare it once in TypeBox and get its TypeScript types, runtime validation and a committed JSON Schema, so that extensions, the daemon and non-TypeScript clients cannot drift apart.

## Acceptance criteria

- [ ] The `agent-protocol` module builds, tests and releases alone (`pnpm install && pnpm test && pnpm build`) and `node scripts/run.mjs ci` picks it up
- [ ] A method or notification is declared with one helper that yields its params and result types; the method namespaces `printer.*`, `camera.*`, `job.*` accept registration from other modules
- [ ] CI regenerates the JSON Schema from the TypeBox definitions and fails if it differs from the committed file
- [ ] The generated schema file validates a sample request for every core method with a stock JSON Schema validator (a second language can implement a client)

## Out of scope

- The printer, camera and job method catalogues (E20, E22); implementing a client in another language.
