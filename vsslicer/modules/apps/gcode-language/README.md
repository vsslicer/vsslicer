# VSSlicer G-code Language

Syntax highlighting for G-code in VS Code: language id `gcode` for `*.gcode`, `*.g`, `*.gco` and `*.nc`. It also activates on startup to add language features (below); it contributes no custom editor (G-code Preview owns that).

Highlighted: G/M/T codes, parameters (`X10.5`, flags like `G28 X Y`), `N` line numbers and `*` checksums, `;` and `( )` comments, `M117`/`M118` message text, Klipper extended commands (`SET_VELOCITY_LIMIT ACCEL=3000`, macros) with `KEY=value` parameters, RepRapFirmware meta commands (`if`, `var`, `set`, `echo` ...) and strings, and the `[var]` and `{expr}` placeholders slicers and macros use.

## Features

- Hover and completion for G/M/T codes and their parameters, from a bundled catalogue of commands per firmware flavour: `marlin`, `prusa-buddy`, `bambu`, `klipper` and `reprapfirmware`. Bambu, Buddy and RepRapFirmware fall back to the Marlin catalogue for codes they lack.
- A warning on commands missing from the file's flavour catalogue.
- A status bar item showing the flavour in use.
- The flavour comes from the file's `;FLAVOR:` or `; gcode_flavor =` line (head, then tail) and its `printer_model` (Bambu Lab, Prusa Buddy). Override it per file with the setting `vsslicer.gcode.flavourOverrides` (file path relative to its workspace folder, or absolute, mapped to one of the five names above).
- Files over 50 MB get no language features; files over 4 MB are scanned for unknown commands on open and save only, not after each edit.

## Large files

`[gcode]` sets `editor.largeFileOptimizations: true`, so VS Code turns tokenisation off for files over 20 MB, and `editor.maxTokenizationLineLength` stays at 20000. `pnpm bench` tokenises a generated 20 MB file with `vscode-textmate` and prints the time.

## Develop

```sh
pnpm install && pnpm lint && pnpm test && pnpm build
pnpm test:grammar:update   # rewrite the .snap files after an intended grammar change
pnpm bench
```

Licensed `AGPL-3.0-or-later`.
