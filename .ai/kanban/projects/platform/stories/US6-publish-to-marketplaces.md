---
id: US6
title: A VS Code or VSCodium user finds, installs and updates VSSlicer from the Extensions view
status: reviewed
epic: VSS:E1
---

A maintainer pushes a tag and the release workflow builds, tests, packages, creates a GitHub release and publishes to open-vsx.org and the Microsoft marketplace, safely re-runnable, with the namespace and publisher claimed and the trusted-publishing question answered. This delivers the feature-matrix row "In-app extension marketplace".

## Acceptance criteria

- [ ] The `vsslicer` namespace on open-vsx.org shows as verified; the issue link and the Microsoft publisher id are recorded in `CONTRIBUTING.md`
- [ ] Trusted-publishing spike answered and recorded as a decision (OIDC to Open VSX, Entra federated credential), with the token fallback and expiry reminder if not available
- [ ] On a tag, the workflow publishes `vsslicer.gcode` (pre-release; the pack alone until E68 delivers it) and the `vsslicer` pack to both marketplaces and creates a GitHub release with VSIX and source tarball; odd minors publish as pre-release
- [ ] Re-running the workflow reports both versions as already published and succeeds; with one marketplace's credential revoked the job fails red naming that marketplace and the other publish still lands
- [ ] No secret appears in workflow logs (masking plus a grep step over the log artefact)
- [ ] Installing the pack in a clean stock VS Code and a clean VSCodium installs `vsslicer.gcode` (manual check recorded with versions, then an integration test against a local VSIX)

## Out of scope

- npm publishing; the self-hosted registry (E68); the VSCodium build (E69).
