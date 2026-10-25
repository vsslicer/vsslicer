---
id: E1
title: Set up the monorepo, CI, test tooling and publishing pipeline
status: reviewed
initiative: I1
project: PLT
order: 1
depends_on: []
rows: ["§16 In-app extension marketplace"]
---

Delivers the repository every VSSlicer project builds in: a pnpm + Turborepo monorepo, CI on GitHub Actions (free public-repository minutes only, D5), the three test harnesses (vitest, `@vscode/test-electron`, Playwright), AGPL-3.0 licence files and SPDX expressions (D2), and a tag-driven release that publishes every extension and the `vsslicer` extension pack to open-vsx.org and the Microsoft VS Marketplace with trusted publishing where the registry supports it. Its users are the other six project boards (they inherit the layout, CI and release) and every VS Code or VSCodium user, who finds VSSlicer through the Extensions view (roadmap "Marketplace plan"; `docs/research/vscode-platform.md` §5, Implications 1 and 7).

## Scope

Decisions this epic makes and records in `CONTRIBUTING.md` and `.ai/instructions.md` "Build and test":

- **Monorepo tool: pnpm workspaces plus Turborepo.** pnpm gives a strict `node_modules` (a package cannot import a dependency it did not declare, which npm and Yarn classic hoisting hide), `workspace:*` links and a content-addressed store that keeps CI installs fast. Turborepo (MIT) adds the task graph (`build` after `^build`, `test` after `build`) and a local content-hash cache that CI saves with `actions/cache`; no remote cache, because the hosted one is a paid service (D5). Rejected: npm workspaces (hoisting), Yarn Plug'n'Play (vsce and the VS Code test tooling expect a real `node_modules`), Nx (generators and plugins we do not need for about 7 libraries and 15 extensions), Lerna (now run by Nx), plain `pnpm -r` (no cache). Reversible: every task is a plain package script, so removing `turbo.json` leaves `pnpm -r run build` working.
- **Layout.** `packages/<name>` holds the libraries `@vsslicer/<name>` (gcode, 3mf, mesh, profiles, printer-api, webview-kit, agent-protocol), private workspace packages bundled into extensions and not published to npm in I1. `extensions/<name>` holds the extensions `vsslicer.<name>` plus `extensions/pack` (the `vsslicer` pack). `apps/agent` holds the `vsslicer-agent` daemon (E22 fills it). `fixtures/` holds small shared fixtures, each folder with a `PROVENANCE.md` (generator, version, settings, licence). `tools/` holds repository checks. One `tsconfig.base.json`, TypeScript project references, esbuild per extension (node and, from E48, browser), ESLint and Prettier, Node pinned in `.nvmrc` to the Node line of VS Code's Electron (24.x at `vscode@4ef6bab7`, `vscode-platform.md` §1).
- **Licence (D2).** Root `LICENSE` with the AGPL-3.0 text; `"license": "AGPL-3.0-or-later"` in every `package.json` (Open VSX requires a licence expression: `licensing.md` §4); an `SPDX-License-Identifier: AGPL-3.0-or-later` header in every source file; ported files keep the upstream copyright line and add `Ported from <project>@<commit>:<path>`; `THIRD-PARTY-NOTICES.md` generated per extension from its bundled dependencies; each VSIX carries `LICENSE`, the notices and a `repository` link at the release tag, which with the GitHub release source tarball is the corresponding source for the VSIX (D2 item 4).
- **Release process.** A pull request carries a Changesets entry; merging to `main` updates a "Version packages" pull request; merging that bumps versions, writes each extension's `CHANGELOG.md` and pushes tags `<package>@<version>`. A tag starts the release workflow: build, full test suite, `vsce package --no-dependencies` from the esbuild bundle (vsce does not follow pnpm's symlinked `node_modules`), VSIX content check, GitHub release with the VSIX and source tarball, then `ovsx publish` and `vsce publish --packagePath`. Odd minor versions publish with `--pre-release`, even minors as releases, because the marketplaces take only `major.minor.patch`. Each marketplace step first asks whether that version already exists and skips it, so re-running a half-failed release publishes only what is missing. An extension that lists `targets` in its `package.json` is packaged once per `vsce --target`; nothing in I1 needs that, later SLC and PRN extensions do (`vscode-platform.md` §1 "Platform-specific VSIX").
- **Publishing identity.** `vsslicer` namespace on open-vsx.org (Eclipse account, Publisher Agreement, verified-namespace issue on `EclipseFdn/open-vsx.org`) and `vsslicer` publisher on the Microsoft marketplace. Trusted publishing: OIDC to Open VSX (server 1.2.0 and later, `vscode-platform.md` §5) and `vsce publish --azure-credential` with an Entra ID federated credential, each only if the spike below confirms it works on the public registry at no cost; otherwise scoped tokens in GitHub encrypted secrets with a recorded expiry.
- **Test tooling.** vitest for libraries; `@vscode/test-electron` for extension tests, run against the `engines.vscode` minimum and current stable on Linux (xvfb), macOS and Windows, and against the latest VSCodium release on Linux (D1: stock VS Code and VSCodium); Playwright with Chromium for webview snapshots, pinned version, snapshots generated only on the Linux runner with SwiftShader WebGL (`--use-angle=swiftshader --enable-unsafe-swiftshader`), since CI runners have no GPU (`3d-viewer.md` §2).
- **Extension pack** `vsslicer` with `extensionPack` listing the extensions that have shipped; `vsslicer.gcode` is its first member (E68).
- Written new; nothing is ported.
- **Out:** npm publishing of libraries; a remote build cache; signing VSIX files ourselves (the marketplaces sign); the self-hosted registry (E68); the VSCodium build (E69); a contributor-licence or DCO check (open question).

## Feature-matrix rows

- §16 In-app extension marketplace (P0): done when every shipped VSSlicer extension and the `vsslicer` pack can be found by searching "vsslicer" in the Extensions view of stock VS Code (Microsoft marketplace) and of VSCodium (open-vsx.org), installs, and updates when CI publishes a new version. The own registry for the VSSlicer build extends this row in E68 without owning it.

## Acceptance criteria

- [ ] From a clean clone, `pnpm install --frozen-lockfile && pnpm turbo run lint build test` passes on the ubuntu, macos and windows runners; a second run with the restored cache skips unchanged packages (cache hit reported by Turborepo).
- [ ] A library that imports a package missing from its own `package.json` fails `build` (regression caught: phantom dependency through hoisting).
- [ ] `tools/check-licence` fails CI when a workspace `package.json` lacks `"license": "AGPL-3.0-or-later"`, when a source file lacks the SPDX header, or when a file with a `Ported from` line lacks an upstream copyright line; each case has a fixture that must fail (regression caught: an upload Open VSX would reject, a port without provenance).
- [ ] The dependency check walks each extension's bundled production dependencies, fails on a licence outside the allow-list (AGPL-3.0, GPL-3.0, LGPL-2.1/3.0, MIT, BSD-2/3, ISC, Apache-2.0, MPL-2.0, CC0, Zlib), and writes `THIRD-PARTY-NOTICES.md`; a fixture dependency marked `UNLICENSED` fails it.
- [ ] A deliberately failing vitest test, a failing `@vscode/test-electron` test and a changed Playwright snapshot each turn the CI job red (meta-tests on a throwaway branch, recorded in the pull request).
- [ ] The `@vscode/test-electron` harness activates a sample extension on the minimum and stable VS Code on all three OSes and on VSCodium on Linux.
- [ ] The Playwright harness loads a webview bundle in Chromium with a stubbed `acquireVsCodeApi`, renders a WebGL2 triangle with SwiftShader and matches its snapshot within a stated pixel tolerance.
- [ ] Packaging asserts each VSIX's file list: bundle, `package.json`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md`, `CHANGELOG.md`, no `node_modules`, tests or `.map` files; the size is printed and a per-extension budget fails the job when exceeded.
- [ ] A fixture extension with `targets: [linux-x64, win32-x64]` packages two VSIX files with the right `--target`.
- [ ] `fixtures/` rejects any file over 5 MB and any folder without `PROVENANCE.md`; large inputs (the 50, 200, 500 MB G-code budget files of I1) are generated in CI, not committed.
- [ ] The release workflow, on a tag, publishes `vsslicer.gcode` (pre-release) and the `vsslicer` pack to both marketplaces and creates a GitHub release with VSIX and source tarball; re-running it reports both versions as already published and succeeds; with one marketplace's credential revoked, the job fails red naming that marketplace and the other publish still lands.
- [ ] Installing the pack in a clean stock VS Code and a clean VSCodium installs `vsslicer.gcode` (manual check recorded with versions, then an integration test against a local VSIX).
- [ ] The `vsslicer` namespace on open-vsx.org shows as verified; the issue link and the Microsoft publisher id are recorded in `CONTRIBUTING.md`.
- [ ] No secret appears in workflow logs (GitHub masking plus a grep step over the log artefact for the token prefixes).

Oracles: the marketplaces themselves (search, install, update), the Open VSX upload validation, and the tests above. No hardware is involved (D5).

## Dependencies

- Needs: nothing. Needs from E68 a first `vsslicer.gcode` build to publish as pre-release (until then the release path is proven with the pack alone).
- Exposes to every project: the layout, `turbo.json` tasks (`lint`, `build`, `test`, `test:integration`, `test:snapshot`, `package`), the three harnesses, the licence and fixture checks, and the release workflow. E2 adds the webview test stub to the Playwright harness; E48 adds the browser build and `@vscode/test-web`; E68 adds a third publish target.

## Risks and spikes

- **Trusted publishing availability** (unverified whether open-vsx.org enables OIDC publishing, and whether Microsoft's federated credential needs a paid Azure subscription). Spike (2 days): publish a throwaway pre-release of the pack from a test tag with each method; record the result as a PLT decision; fallback is scoped tokens with a calendar reminder before expiry.
- **vsce with pnpm.** Unverified how current vsce treats a pnpm workspace; the esbuild bundle plus `--no-dependencies` sidesteps it, and the VSIX file-list test catches a regression.
- **Repository hosting.** Free minutes and the AGPL source link assume a public GitHub repository; there is no remote yet (open question to the owner).
- **Snapshot flakiness** across SwiftShader versions: pin Playwright and its Chromium, regenerate snapshots only in a dedicated job.
- **Marketplace review delays or rejections** of a new publisher: start the namespace and publisher claims in the first sprint.

## Eng review

- Scope challenge: considered splitting "publishing" into its own epic; kept it here because it is one workflow on top of the CI this epic builds, and I1's exit criterion is that CI publishes on tag. Deliberately out: npm publishing, remote cache, a DCO bot, the own registry.
- Tests: each check above names the regression it catches; meta-tests prove the harnesses can fail, which is the usual silent failure of new CI.
- Boring technology: pnpm, Turborepo, Changesets, esbuild, GitHub Actions; no innovation token spent.
- Blast radius: a bad release reaches every user on auto-update, and the marketplaces cannot roll back a version. Mitigation: odd-minor pre-releases first; rollback is a new patch built from the previous tag, which the workflow supports by tagging a revert.
- Zero silent failures: a half-failed dual publish was the main gap found; the idempotent per-marketplace step and the named failure fix it. Expired tokens fail red with the marketplace named.
- Changed because of the review: added the VSIX content assertion, the licence allow-list and provenance lint, the 5 MB fixture cap, and VSCodium in the integration matrix.

## Coordinator reconciliation

- Picks the shared zip library for the VWR 3MF and PRF bundle epics. Public GitHub repository, DCO, unsigned Linux builds and the registry's budget gate are D10.
