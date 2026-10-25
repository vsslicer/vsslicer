---
id: US72
title: "Add a Snapmaker printer over SACP"
status: reviewed
epic: VSS:E60
---

As an owner of a Snapmaker J1, Artisan or Ray, I want to find the machine, see status and send files from VS Code, so that I can use it without Luban.

## Acceptance criteria

- [ ] A spike vets the `@snapmaker/snapmaker-sacp-sdk` 0.1.1 tarball (ISC) and decides between depending on it and writing our own codec
- [ ] UDP `discover` on port 20054 lists machines; SACP over TCP port 8888 gives status; upload and start pass the contract kit on recorded fixtures
- [ ] It is labelled `reverse engineered`, gated by firmware and read-only on an unknown one

## Out of scope

- Legacy SSTP over HTTP; CNC and laser workflows.
