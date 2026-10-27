---
id: 215
title: Make @vsslicer lockfile checksums match on every machine
type: bug
priority: P0
effort: M
model: opus
sprint: "VSS:SP14"
created: 2026-10-27
---

First full GitHub CI run (run 40562150500, 2026-10-27): on Linux and macOS, `pnpm install --frozen-lockfile` in `core/3mf` fails with `ERR_PNPM_TARBALL_INTEGRITY` for `@vsslicer/tooling@0.8.5`. CI builds and publishes every module into a fresh Verdaccio (D12), and the tarball bytes differ from the ones whose integrity the committed lockfiles record.

Likely cause (not yet proven): gzip. The owner's Mac runs Homebrew Node 26 with the shared system zlib 1.2.12 (`process.config.variables.node_shared_zlib = true`); GitHub's setup-node uses the official build with Node's bundled zlib. Same files, different deflate output, different sha512.

Package: `vsslicer/scripts` (runner, publish) and the D12 registry design. Layer: tooling.

Options for the owner (proposed decision to write first):
1. Publish once to a shared registry (npmjs.org under a `vsslicer` org, or GitHub Packages) so every machine installs the same bytes; the local Verdaccio stays for unreleased work only.
2. Make packing deterministic regardless of zlib: pack with a pure-JS gzip at a fixed level (our own pack step instead of `pnpm pack`).
3. Stop pinning integrity of `@vsslicer/*` tarballs (weakens the stale-pin and supply-chain checks).

Done when: the full GitHub CI run passes `pnpm install --frozen-lockfile` on all three OSes with lockfiles committed from the owner's machine, and a test proves a tarball packed on two different zlib builds has the same integrity (option 2) or that installs resolve from the shared registry (option 1).