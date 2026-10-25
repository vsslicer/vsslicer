---
id: US66
title: "A VSSlicer user installs from our registry with fall-through and updates from GitHub releases"
status: reviewed
epic: VSS:E69
---

As a VSSlicer user, I want the editor to search and install from the VSSlicer registry with open-vsx.org behind it, and to be offered newer builds from GitHub releases, so that I get extensions and updates without the Microsoft Marketplace.

## Acceptance criteria

- [ ] From the build, search and install an extension from E68's registry and a public extension through fall-through; no request goes to the Microsoft Marketplace (proxy log in the smoke test)
- [ ] A newer build published as a GitHub release is offered and installed on Linux and, once signed, on macOS and Windows
- [ ] The update path is a spike result first: how VSCodium finds updates, and what we publish to match

## Out of scope

- A hosted update server beyond GitHub releases.
