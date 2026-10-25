---
id: US69
title: "A user of any VS Code, VSCodium or VSSlicer picks a VSSlicer colour or file-icon theme"
status: reviewed
epic: VSS:E69
---

As a VS Code, VSCodium or VSSlicer user, I want dark, light and high-contrast VSSlicer colour themes and a file-icon theme for 3D-printing files, so that the editor and the webviews look right and printing files are recognisable. The build uses them by default.

## Acceptance criteria

- [ ] `vsslicer.themes` is published to both marketplaces and installs in stock VS Code and VSCodium
- [ ] A script checks WCAG AA contrast for editor foreground/background and the main token colours in each colour theme (dark, light, high-contrast dark and light) and fails below it
- [ ] The file-icon theme covers `.3mf`, `.stl`, `.obj`, `.step`, `.gcode`, `.bgcode`, `.gcode.3mf` and profile files
- [ ] Webview colours follow the theme through E2's theme tokens; snapshot tests of the G-code preview and model viewer in each theme pass through E2's Playwright stub
- [ ] `vsslicer.themes` is the default theme of the VSSlicer build

## Out of scope

- Product icon themes.
