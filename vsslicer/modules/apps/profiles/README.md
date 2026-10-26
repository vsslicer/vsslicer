# VSSlicer Profiles

VS Code extension `vsslicer.profiles` (extension id `vsslicer.profiles`, via `vsslicer.extensionName`): the composition root that will wire the `profiles` core to the ecosystem adapters. Skeleton only; it contributes one command, `VSSlicer: About Profiles Extension`, and activates on a workspace containing `.vsslicer/profiles/`.

Licensed `AGPL-3.0-or-later`.

## Package

```sh
pnpm build && pnpm package
```

## Limitations

- **Multi-root workspaces.** User profiles go to the first workspace folder that contains `.vsslicer/`, else the
  first folder; with no folder open there is no user store (see [docs/multi-root.md](docs/multi-root.md)).
- **Remote and web.** The extension runs where the workspace is (`extensionKind: workspace`). Over Remote-SSH, WSL,
  Dev Containers or Codespaces, it looks for installed slicers (OrcaSlicer, PrusaSlicer, Bambu Studio, Cura) and their
  profile folders on the remote machine, not on your computer. Slicers installed only on your computer are not found
  there. Use import from file instead. In VS Code for the Web (vscode.dev, github.dev) the extension does not run,
  because it has no browser build.
