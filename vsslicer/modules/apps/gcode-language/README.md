# VSSlicer G-code Language

Syntax highlighting for G-code in VS Code: language id `gcode` for `*.gcode`, `*.g`, `*.gco` and `*.nc`. A declarative extension: it runs no code and contributes no custom editor (G-code Preview owns that).

Highlighted: G/M/T codes, parameters (`X10.5`, flags like `G28 X Y`), `N` line numbers and `*` checksums, `;` and `( )` comments, `M117`/`M118` message text, Klipper extended commands (`SET_VELOCITY_LIMIT ACCEL=3000`, macros) with `KEY=value` parameters, RepRapFirmware meta commands (`if`, `var`, `set`, `echo` ...) and strings, and the `[var]` and `{expr}` placeholders slicers and macros use.

## Large files

`[gcode]` sets `editor.largeFileOptimizations: true`, so VS Code turns tokenisation off for files over 20 MB, and `editor.maxTokenizationLineLength` stays at 20000. `pnpm bench` tokenises a generated 20 MB file with `vscode-textmate` and prints the time.

## Develop

```sh
pnpm install && pnpm lint && pnpm test && pnpm build
pnpm test:grammar:update   # rewrite the .snap files after an intended grammar change
pnpm bench
```

Licensed `AGPL-3.0-or-later`.
