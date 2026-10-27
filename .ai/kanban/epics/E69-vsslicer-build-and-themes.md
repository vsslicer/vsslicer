---
id: E69
title: Build the VSCodium-based VSSlicer distribution
status: draft
initiative: I11
project: PLT
order: 6
depends_on: [E1, E68, E70]
rows: []
---

Delivers the VSSlicer-branded editor: a build of VSCodium's scripts (MIT) with our `product.json` branding, the VSSlicer extensions built in, the stock chrome removed (Accounts, the gear menu's Settings entry, Extensions with its MCP gallery, Run and Debug, Source Control; D23 step 2) and replaced by the VSSlicer settings page and extensions view, which reads our static marketplace (E68, D24) instead of a gallery. Electron switches only where the I1 and I7 spikes call for them, update through GitHub releases, and signed and notarised installers once a signing budget exists (D5). Its users are people who want a printing-focused editor rather than an extension set (D1, I11).

Owner, 2026-10-27: the build runs straight after M2 and before M3 (M6 moved), because stock VS Code can't remove its own chrome. Themes moved to their own epic, E71, at the end of the roadmap. Research: `docs/research/vscodium-build.md`.

## Scope

- **In:**
  - The public repo `vsslicer/vsslicer-build` (not a folder in this repo): our patches and config on top of a pinned VSCodium release tag; a `product.json` overlay with `nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `urlProtocol`, `darwinBundleIdentifier`, `win32*AppId`, `builtInExtensions` (the VSSlicer extensions as local `vsix` entries with `sha256`), `updateUrl`, no `extensionsGallery` and no `mcpGallery` (D24), and `extensionEnabledApiProposals` only for a proposed API a spike justified (`vscode-platform.md` §4).
  - Chrome removal (`vscodium-build.md` §4): one new contribution file that deregisters the Extensions, Run and Debug and Source Control containers listed in `product.json` and adds our gear entries; a small patch hiding Accounts; a small patch dropping the stock Settings and Extensions gear entries; a folder-removal list for unused built-ins (git, GitHub, debug helpers, task runners).
  - CI builds on GitHub Actions for the targets VSCodium supports that we choose to ship (initially linux-x64, linux-arm64, darwin-arm64, darwin-x64, win32-x64), reproducibility checks, smoke tests per target.
  - Signing: macOS Developer ID and notarisation (`xcrun notarytool`), Windows through SignPath OSS or a certificate (`vscode-platform.md` §4), switched on only when the owner records a budget decision; until then only unsigned Linux builds are released (D10), and macOS and Windows installers wait for D5's budget.
  - Third-party notices and a source offer for every copyleft component bundled, no Microsoft marks, icons or Microsoft-licensed extensions (`licensing.md` §2 (d), (g)).
- **Code origin:** build scripts follow VSCodium (MIT) and Code-OSS (MIT); our patches are AGPL-3.0-or-later like the rest of the project.
- **Out:** a Theia-based product (roadmap question 31); our own extension-signature verifier; a hosted update server beyond GitHub releases; themes (E71).

## Feature-matrix rows

None. §16 Themes moved to E71.

## Acceptance criteria

- [ ] The build is reproducible: two CI runs from the same VSCodium tag and our commit produce identical Linux artefacts (or the differing files are listed and explained).
- [ ] Smoke test per shipped target: install, start, the built-in VSSlicer extensions are active, Accounts, Extensions, Run and Debug and Source Control are absent, the gear menu's Settings opens the VSSlicer settings page, open the G-code and 3MF fixtures, quit cleanly. (Slicing the cube with the Orca CLI joins the smoke test in M3: PLT-162.)
- [ ] Marketplace: from the build, the VSSlicer extensions view lists `index.json` (E68, D24) and installs an extension from it; no request goes to the Microsoft Marketplace or open-vsx.org (checked with a proxy log in the smoke test).
- [ ] Update: a newer build published as a GitHub release is offered and installed on Linux and, once signed, on macOS and Windows.
- [ ] Signed builds (when budget exists): `codesign --verify` and `spctl` pass on macOS, `signtool verify` on Windows.
- [ ] `THIRD-PARTY-NOTICES` and the source offer are present in every installer.
- [ ] A rebase rehearsal on the next VSCodium release after the first build is documented with time spent and patches that broke.
- [ ] The product name passes a trademark search recorded by the owner before the first public build (roadmap question 4).

Verified on CI runners and the owner's machines; the slice smoke test uses fixtures, no printer.

## Dependencies

- Needs: E1 (CI, release), E68 (`index.json`), E70 (the workbench extension and its views), the extensions published so far (later ones join as they release), the I1 WebGPU probe (E2) and I7 camera codec spikes (PRN) to decide Electron switches.
- Exposes: the build and its update channel.

## Risks and spikes

- **Budget** (D5): signing certificates, Apple Developer ID and maintenance time; signed releases wait for an owner decision.
- **Monthly rebase** onto VSCodium release tags: VSCodium's own 56 patches arrive already rebased; ours are three small patches and a new file (`vscodium-build.md` §2); the rehearsal measures the cost before we commit to a cadence.
- **Microsoft-licensed extensions** are unavailable in forks, a loss for users who also code (`vscode-platform.md` §4); documented on the download page.
- **Electron switches** (WebGPU, codecs) depend on spikes that may say "not needed"; the default is none.

## Eng review

- Scope challenge: themes were merged here and split out again (E71) because the owner wants them last. The marketplace (E68) stays apart: a separate repo with its own release.
- Reversibility: the build changes no extension code (D1), so dropping it leaves every user on the marketplaces; a bad build is rolled back by re-publishing the previous GitHub release as latest.
- Blast radius: a broken build affects only its users; extensions keep shipping through E1.
- Zero silent failures: the proxy-log check catches an accidental Microsoft Marketplace endpoint; signature verification and smoke tests fail the release.
