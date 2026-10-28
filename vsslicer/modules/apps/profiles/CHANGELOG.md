# Changelog

## 0.0.3

- Dev: `@vsslicer/test-vscode` ^0.2.4 (software WebGL option for GPU-less CI). (PLT-225)

## 0.0.2

- Repository URL points at github.com/vsslicer/vsslicer (PLT-214).

## 0.0.1

- Moved to `vsslicer/modules/apps/profiles`; the repository URL follows (PLT-204).

## Unreleased

- Document the multi-root rule for the user-profile folder and the remote/web limitation (PRF-58).
- PRF-60: synthetic fixtures in `test/fixtures/`: `workspace` (an Orca vendor, a Prusa vendor bundle, a profile file) and `slicer-config-{macos,windows,linux}` (user presets of Orca, Bambu Studio, PrusaSlicer, SuperSlicer and Cura in each OS layout).
- PRF-67: `contributes.jsonValidation` maps `.vsslicer/profiles/<entity>/**/*.json` to the published `@vsslicer/profile-api` schemas, shipped in `schemas/` (only the `https://vsslicer.dev/schema/profile/` prefix becomes `./`, because VS Code will not fetch it); `pnpm sync-schemas` refreshes them and a hash test guards them.
- Skeleton: activation, layer folders, one command, VSIX packaging. (PRF-57)
