---
id: US5
title: A maintainer produces correct VSIX files and versions with one command each
status: reviewed
epic: VSS:E1
---

A maintainer adds a Changesets entry per pull request and runs `package` to get a VSIX whose contents and size are asserted, including platform-specific builds, plus a skeleton `vsslicer` extension pack ready to list the first extension.

## Acceptance criteria

- [ ] Packaging asserts each VSIX's file list (bundle, `package.json`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md`, `CHANGELOG.md`; no `node_modules`, tests or `.map` files); the size is printed and a per-extension budget fails the job when exceeded
- [ ] A fixture extension with `targets: [linux-x64, win32-x64]` packages two VSIX files with the right `--target`
- [ ] A pull request without a Changesets entry is flagged, and merging the "Version packages" pull request writes `CHANGELOG.md` and tags `<package>@<version>`
- [ ] `extensions/pack` builds a `vsslicer` pack whose `extensionPack` lists the shipped extensions

## Out of scope

- The `vsslicer.gcode` extension itself (E68); signing.
