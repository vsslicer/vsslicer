---
id: E71
title: Ship vsslicer.themes, colour and file-icon themes for VS Code, VSCodium and the VSSlicer build
status: draft
initiative: I11
project: PLT
order: 7
depends_on: [E1, E69]
rows: ["§16 Themes"]
---

Delivers `vsslicer.themes`: a dark and a light colour theme, high-contrast dark and light variants, and a file-icon theme for 3D-printing files, which the VSSlicer build (E69) uses by default and which stock VS Code and VSCodium users can install. Split out of E69 on 2026-10-27: the owner wants themes last, so this epic sits at the end of the roadmap (milestone M8), after M5.

## Scope

- **In:** the module `vsslicer/modules/themes` (`vsslicer.themes`): the palette model and theme builder, the four colour themes, a WCAG AA contrast check, the file-icon theme covering `.3mf`, `.stl`, `.obj`, `.step`, `.gcode`, `.bgcode`, `.gcode.3mf` and profile files; webview colours follow the theme through E2's theme tokens; snapshot tests of the G-code preview and the model viewer in each theme; the build's default theme (PLT-168). Published through the VSSlicer marketplace (E68, D24) and, once accounts exist (M7), the public marketplaces.
- **Code origin:** theme files written new; AGPL-3.0-or-later.
- **Out:** product icon themes.

## Feature-matrix rows

- §16 Themes (P3): done when `vsslicer.themes` is published, passes the contrast check, and is the default theme of the VSSlicer build.

## Acceptance criteria

- [ ] A script checks WCAG AA contrast for editor foreground/background and the main token colours in each colour theme and fails below it.
- [ ] Snapshot tests of the G-code preview and model viewer in each theme pass through E2's Playwright stub.
- [ ] The file-icon theme covers every listed extension (coverage test).
- [ ] The VSSlicer build starts with the VSSlicer dark theme and file-icon theme.

## Dependencies

- Needs: E1 (release), E69 (the build, for the default theme), E2 (theme tokens), the G-code preview and viewer releases for snapshots.
- Exposes: theme tokens consumed by every webview through E2.

## Stories and cards

US69 (moved from E69): PLT-132..145 and PLT-168.
