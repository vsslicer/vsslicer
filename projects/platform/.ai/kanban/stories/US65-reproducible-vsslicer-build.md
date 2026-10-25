---
id: US65
title: "A maintainer builds a branded, reproducible VSSlicer editor from a pinned VSCodium tag"
status: reviewed
epic: VSS:E69
---

As a maintainer, I want CI to build VSSlicer from VSCodium's scripts with our `product.json` branding and patches for the targets we ship, reproducibly, so that a bad build is traceable and a rebase on the next VSCodium release is a known cost.

## Acceptance criteria

- [ ] The build is reproducible: two CI runs from the same VSCodium tag and our commit produce identical Linux artefacts (or the differing files are listed and explained)
- [ ] `product.json` carries `nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `urlProtocol`, `darwinBundleIdentifier`, `win32*AppId`, `extensionsGallery`, `controlUrl`, `builtInExtensions` with `sha256`, `updateUrl`; `extensionEnabledApiProposals` only for a spike-justified API
- [ ] CI builds linux-x64, linux-arm64, darwin-arm64, darwin-x64 and win32-x64 (the macOS and Windows outputs stay unsigned CI artefacts until the budget exists)
- [ ] No Microsoft marks, icons or Microsoft-licensed extensions in the output (checked)
- [ ] Electron switches are added only if the WebGPU and camera-codec spikes call for them; the default is none
- [ ] A rebase rehearsal on the next VSCodium release after the first build is documented with time spent and patches that broke
- [ ] The product name passes a trademark search recorded by the owner before the first public build (roadmap question 4)

## Out of scope

- A Theia-based product; removal of unrelated UI beyond what VSCodium already patches.
