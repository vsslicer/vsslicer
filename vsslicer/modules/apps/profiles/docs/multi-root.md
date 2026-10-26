# Multi-root workspaces: which folder holds user profiles

Spike PRF-58, 2026-10-26. Raw notes and probe sources: `.reference/notes/PRF-58-workspace-folder-for-user-profiles.md`.

## Rule

User profiles live in `<folder>/.vsslicer/profiles/` of exactly one workspace folder, chosen as:

1. the first entry of `vscode.workspace.workspaceFolders` that contains `.vsslicer/`;
2. else the first entry (`workspaceFolders[0]`), where `.vsslicer/` is created on the first write;
3. no folder open: no user-profile store (read-only bundled and imported profiles only).

"First" is the order of the `folders` array in the `.code-workspace` file. Check for `.vsslicer/` with
`vscode.workspace.fs.stat`, not `node:fs`, so the rule also holds on remote and virtual file systems.

## Evidence

VS Code builds `workspaceFolders` in the order the `.code-workspace` file lists them, drops duplicates and numbers
`index` from 0, with no sorting (`vscode@4ef6bab7:src/vs/platform/workspaces/common/workspaces.ts:198-235`). The
activation event `workspaceContains:.vsslicer/profiles/` fires when any folder has the path, not only the first
(`vscode@4ef6bab7:src/vs/workbench/services/extensions/common/workspaceContains.ts:71-80`).

The test-electron run (macOS arm64, `@vscode/test-electron` 3.1.0, VS Code 1.100.0 and 1.143.1) opened a workspace
listing `zeta`, `alpha`, `mid`, `./zeta`. Both versions gave the same result:

| Workspace                               | `workspaceFolders` (index:name) | Chosen  | Activated by `workspaceContains` |
| --------------------------------------- | ------------------------------- | ------- | -------------------------------- |
| `.vsslicer/profiles/` in `alpha`, `mid` | `0:zeta 1:alpha 2:mid`          | `alpha` | yes                              |
| no `.vsslicer/`                         | `0:zeta 1:alpha 2:mid`          | `zeta`  | no                               |

The duplicate `./zeta` was dropped, and the folders kept the file's order (not alphabetical, not creation order).
`rootPath` (deprecated) was `zeta` in both runs.

## Consequences

- The choice is stable while the user keeps the folder order. Reordering folders in the workspace file can move the
  store. If the first folder changes, the extension host restarts (`vscode@4ef6bab7:src/vscode-dts/vscode.d.ts:13875-13881`),
  so the extension re-runs the rule. Adding or removing any other folder fires `onDidChangeWorkspaceFolders`, and the
  extension re-runs the rule then too.
- When several folders have `.vsslicer/`, only the first is the user store. The others stay ordinary files: their
  profile JSON still gets schema validation (`jsonValidation` matches `**/.vsslicer/profiles/...`).
- `@vsslicer/test-vscode` opens no workspace, so the integration suite cannot pin this rule yet. A `workspace` option
  there (platform card) would let it.

## README limitation (draft)

> **Remote and web.** The extension runs where the workspace is (`extensionKind: workspace`). Over Remote-SSH, WSL,
> Dev Containers or Codespaces, it looks for installed slicers (OrcaSlicer, PrusaSlicer, Bambu Studio, Cura) and their
> profile folders on the remote machine, not on your computer. Slicers installed only on your computer are not found
> there. Use import from file instead. In VS Code for the Web (vscode.dev, github.dev) the extension does not run,
> because it has no browser build.

Sources: remote extension placement, https://code.visualstudio.com/api/advanced-topics/remote-extensions; web
extensions need a `browser` entry point, https://code.visualstudio.com/api/extension-guides/web-extensions. Not tested
in this spike: no remote or web host was run (unverified beyond those docs).
