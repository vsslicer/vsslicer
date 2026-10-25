---
id: E69
title: Build the VSCodium-based VSSlicer distribution and vsslicer.themes
status: draft
initiative: I11
project: PLT
order: 6
depends_on: [E1, E68]
rows: ["§16 Themes"]
---

Delivers the VSSlicer-branded editor: a build of VSCodium's scripts (MIT) with our `product.json` branding, the VSSlicer extensions built in, our registry (E68) as the default gallery with open-vsx.org behind it, Electron switches only where the I1 and I7 spikes call for them, update through GitHub releases, and signed and notarised installers once a signing budget exists (D5). It also delivers `vsslicer.themes`, colour and file-icon themes that the build uses by default and that stock VS Code and VSCodium users can install from the marketplaces (owner: themes last). Its users are people who want a printing-focused editor rather than an extension set (D1, I11).

## Scope

- **In:**
  - `distro/build/`: our patches and config on top of a pinned VSCodium tag; `product.json` fields `nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `urlProtocol`, `darwinBundleIdentifier`, `win32*AppId`, `extensionsGallery`, `controlUrl`, `builtInExtensions` (the VSSlicer extensions with `sha256`), `updateUrl`, and `extensionEnabledApiProposals` only for a proposed API a spike justified (`vscode-platform.md` §4). Removal of unrelated UI only where VSCodium already carries a patch.
  - CI builds on GitHub Actions for the targets VSCodium supports that we choose to ship (initially linux-x64, linux-arm64, darwin-arm64, darwin-x64, win32-x64), reproducibility checks, smoke tests per target.
  - Signing: macOS Developer ID and notarisation (`xcrun notarytool`), Windows through SignPath OSS or a certificate (`vscode-platform.md` §4), switched on only when the owner records a budget decision; until then builds are unsigned and, if the owner agrees, released for Linux only (open question).
  - Third-party notices and a source offer for every copyleft component bundled, no Microsoft marks, icons or Microsoft-licensed extensions (`licensing.md` §2 (d), (g)).
  - `extensions/themes` (`vsslicer.themes`): a dark and a light colour theme, high-contrast dark and light variants, and a file-icon theme covering `.3mf`, `.stl`, `.obj`, `.step`, `.gcode`, `.bgcode`, `.gcode.3mf` and profile files; webview colours follow the theme through E2's theme tokens. Published to both marketplaces through E1 before the build exists.
- **Code origin:** build scripts follow VSCodium (MIT) and Code-OSS (MIT); our patches are AGPL-3.0-or-later like the rest of the repository; theme files written new.
- **Out:** a Theia-based product (roadmap question 31); our own extension-signature verifier; a hosted update server beyond GitHub releases; product icon themes.

## Feature-matrix rows

- §16 Themes (P3): done when `vsslicer.themes` is published to both marketplaces, passes the contrast check, and is the default theme of the VSSlicer build. P3 in the matrix, but scheduled here because the owner asked for themes with the distribution.

## Acceptance criteria

- [ ] The build is reproducible: two CI runs from the same VSCodium tag and our commit produce identical Linux artefacts (or the differing files are listed and explained).
- [ ] Smoke test per shipped target: install, start, the built-in VSSlicer extensions are active, open the G-code and 3MF fixtures, slice the cube fixture with a downloaded Orca CLI (E26), quit cleanly.
- [ ] Gallery: from the build, search and install an extension from E68's registry and a public extension through fall-through; no request goes to the Microsoft Marketplace (checked with a proxy log in the smoke test).
- [ ] Update: a newer build published as a GitHub release is offered and installed on Linux and, once signed, on macOS and Windows.
- [ ] Signed builds (when budget exists): `codesign --verify` and `spctl` pass on macOS, `signtool verify` on Windows.
- [ ] `THIRD-PARTY-NOTICES` and the source offer are present in every installer.
- [ ] A rebase rehearsal on the next VSCodium release after the first build is documented with time spent and patches that broke.
- [ ] Themes: a script checks WCAG AA contrast for editor foreground/background and the main token colours in each colour theme and fails below it; snapshot tests of the G-code preview and model viewer in each theme through E2's Playwright stub.
- [ ] The product name passes a trademark search recorded by the owner before the first public build (roadmap question 4).

Verified on CI runners and the owner's machines; the slice smoke test uses fixtures, no printer.

## Dependencies

- Needs: E1 (CI, release), E68 (registry URL), every extension published (I1 to I10), E26 (engine download for the smoke test), the I1 WebGPU probe (E2) and I7 camera codec spikes (PRN) to decide Electron switches.
- Exposes: the build and its update channel; `vsslicer.themes` to all users; theme tokens consumed by every webview through E2.

## Risks and spikes

- **Budget** (D5): signing certificates, Apple Developer ID and maintenance time; signed releases wait for an owner decision.
- **Monthly rebase** over VSCodium's 41 top-level patches plus ours (`vscode-platform.md` §4): the rehearsal measures the cost before we commit to a cadence.
- **Microsoft-licensed extensions** are unavailable in forks, a loss for users who also code (`vscode-platform.md` §4); documented on the download page.
- **Electron switches** (WebGPU, codecs) depend on spikes that may say "not needed"; the default is none.

## Eng review

- Scope challenge: `vsslicer.themes` alone is under two sprints, so it is merged here, where the build makes it the default; it is still published on its own first, so stock VS Code users get it without the build. Considered merging the registry (E68) in as well; kept apart because it is a separate running service.
- Reversibility: the build changes no extension code (D1), so dropping it leaves every user on the marketplaces; a bad build is rolled back by re-publishing the previous GitHub release as latest.
- Blast radius: a broken build affects only its users; extensions keep shipping through E1.
- Zero silent failures: the proxy-log check catches an accidental Microsoft Marketplace endpoint; signature verification and smoke tests fail the release.
