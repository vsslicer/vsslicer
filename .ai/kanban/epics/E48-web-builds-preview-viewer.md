---
id: E48
title: Ship web builds of the G-code preview and the model viewer for vscode.dev
status: draft
initiative: I10
project: PLT
order: 4
depends_on: [E1, E2, E3, E5, E9, E10]
rows: ["§16 Web or browser target"]
---

Delivers `browser` builds of `vsslicer.gcode` (preview, simulation, G-code language) and of `vsslicer.project` in viewer mode, so a user on vscode.dev, github.dev or another browser-hosted VS Code can open a `.gcode`, `.bgcode`, `.gcode.3mf`, `.3mf` or `.stl` from a repository or (on Chrome and Edge) a local folder and inspect it. Desktop-only features (printers, slicing, live follow, the daemon) are hidden on the web, not broken. Its users are people who share print files in repositories and anyone without a desktop install (`vscode-platform.md` §6 "Web-only"; feature matrix §16 "Web or browser target").

## Scope

- **In (PLT):**
  - The browser build target in the monorepo: esbuild `platform: browser` bundles with a `browser` entry in each extension's `package.json`, a lint rule that fails when a module reachable from a browser entry imports a Node built-in (`fs`, `worker_threads`, `child_process`, `net`).
  - A small worker shim in `@vsslicer/webview-kit/host` that starts a parser worker as `worker_threads` on desktop and as a Web `Worker` in the web extension host, with the same message interface.
  - File access through `vscode.workspace.fs` only on the web (no Node streams), with a stated maximum file size on the web and a message beyond it.
  - `@vscode/test-web` in CI (Chromium headless) running each extension's web integration tests; publishing the web-capable VSIX through the E1 release.
  - Context keys and `when` clauses so commands that need Node, the network or the daemon do not appear on the web, with a one-line explanation where a user would expect them.
- **In (with GCP and VWR, in their extensions):** keeping the browser path of `@vsslicer/gcode`, `@vsslicer/3mf` and `@vsslicer/mesh` free of Node-only imports, which the lint rule enforces.
- **Code origin:** written new.
- **Out:** web builds of the slicer or any engine (no process spawning in the web host; roadmap extension table), printers, cameras, the daemon, profile import from upstream downloads, and `vsslicer.project` editing (I6) on the web.

## Feature-matrix rows

- §16 Web or browser target (P2): done when `vsslicer.gcode` and `vsslicer.project` (viewer) install on vscode.dev from the Microsoft marketplace, open the I1 and I2 fixture corpora, and pass their web integration tests in CI.

## Acceptance criteria

- [ ] `@vscode/test-web` runs the G-code preview and model viewer integration tests on every pull request that touches their browser path.
- [ ] The lint rule fails on a fixture module that imports `fs` from a browser entry (regression caught: a desktop-only import that breaks activation on vscode.dev).
- [ ] The golden-file corpus from E3 parses to the same summary statistics in the web worker as on desktop (same test data, both runtimes).
- [ ] Opening a file over the web size limit shows the stated message and opens nothing; a file under it opens within a stated time on the CI runner.
- [ ] On vscode.dev, a manual checklist (recorded with browser and date): open a G-code file from a public GitHub repository, scrub layers, read thumbnails; open a 3MF; on Chrome, open a local folder with File System Access.
- [ ] Printer, slice and live-follow commands are absent from the command palette on the web (test asserts the contributed `when` clauses).

Verified on fixtures and in Chromium only; no printer is involved.

## Dependencies

- Needs: E1 (build, CI, release), E2 (transport and renderer, already browser code), E3 and E5 (the parser and preview), E9 and E10 (mesh library and viewer).
- Exposes: the browser build target, the Node-import lint rule, the worker shim and the `@vscode/test-web` harness to any project that wants a web build later.

## Risks and spikes

- **Workers inside the web extension host** (itself a WebWorker): whether nested workers start under vscode.dev's CSP is unverified. Spike first; the fallback is chunked parsing in the extension host worker with yields, at a lower file-size limit.
- **Memory in a browser tab** is lower than on desktop; the size limit comes from the spike's measurement.
- **Owner interest**: roadmap owner question 30 asks whether the web build is worth maintaining; this epic stays draft until it is answered.

## Eng review

- Scope challenge: the smallest version is the build, lint, worker shim, test harness and capability gating; everything feature-specific already exists in GCP and VWR. Considered splitting into "preview web" and "viewer web"; kept as one, since the plumbing is shared and each extension's part is small.
- Hidden coupling: the only cross-project contract is "no Node imports on the browser path", and it is enforced by a lint rule rather than by convention.
- Blast radius: a broken web build affects only web users; desktop builds use the `main` entry and are tested separately.
- Zero silent failures: missing desktop features are hidden with an explanation, oversize files get a message, worker start failure falls back with a logged reason.
