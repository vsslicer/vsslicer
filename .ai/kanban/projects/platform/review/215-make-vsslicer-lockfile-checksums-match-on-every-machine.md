---
id: 215
title: Make @vsslicer lockfile checksums match on every machine
type: bug
priority: P0
effort: M
model: opus
sprint: "VSS:SP14"
owner: PLT-215-worker
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
## Progress

Owner decision: option 2 (deterministic tarball bytes). Notes: `.reference/notes/PLT-215-deterministic-pack.md`.

**Cause (proven on this machine; the official-Node side is inferred).** pnpm 11.22.0 `packPkg` builds the tar in JS (tar-stream, fixed mtime, mode 0o755/0o644, packlist order, not sorted) and gzips it with `node:zlib` `createGzip`. Packing tooling@0.8.5 here twice gives `sha512-d+ZPpjyQ...` (exactly the lockfile's). Its gunzipped tar re-gzipped with node:zlib gives the same hash; the same tar gzipped by fflate or pako gives other hashes. So the deflate implementation alone changes the integrity. Official Node bundles Chromium's zlib fork, which deflates differently (CI's macOS and ubuntu runners even disagree with each other: `WYPeC7nM...` and `smsHWYgz...`). Running the official Node binary locally was blocked by the sandbox, so that last step was not rerun.

**Change** (`vsslicer/scripts`, tooling layer):
- `scripts/pack.mjs` (new): `packDeterministic(dir)` runs `pnpm pack` (files, prepack, publishConfig, manifest rewriting unchanged), then `normaliseTgz`: gunzip, sort entries by path (a pax or GNU long-name header stays with its entry), normalise headers (mode 0o755 if executable else 0o644, uid/gid 0, empty uname/gname, mtime 1985-10-26T08:15Z, device 0, checksum recomputed), gzip with fflate 0.8.3 (pure JS) at level 9 with no gzip timestamp.
- `scripts/run.mjs` publish: `pnpm publish <deterministic tgz> --no-git-checks` (pack.mjs is imported lazily, so `--list` and version-check still run with no scripts/node_modules).
- `scripts/package.json` + `pnpm-lock.yaml`: devDependency `fflate` 0.8.3 (exact, already in the tree via 3mf and gcode-parser).
- `scripts/registry.sh start`: always runs `pnpm install --frozen-lockfile` in scripts, so older checkouts pick up fflate.
- `scripts/test/pack.test.mjs`: new test. Five different inputs (node:zlib levels 1 and 9, fflate level 6, and entries reversed with a different uid, mtime, mode and uname under both node:zlib and fflate) all normalise to one sha512. The output is sorted and readable by the system tar.
- Re-locked: the local Verdaccio storage moved to `.registry/storage.bak-PLT-215`, everything republished, and 69 `@vsslicer/*` integrities in 39 module lockfiles replaced with the registry's new `dist.integrity`. No version bumps: lockfiles are not published files, and version-check passes.

**Verification**
- `cd vsslicer/scripts && node --test test/*.test.mjs`: 122 pass, 1 fail (the existing "no cache step for fixtures nothing generates", not this card's).
- `cd vsslicer && node scripts/run.mjs ci`: exit 0 (install --frozen-lockfile, lint, build, test, lockfile integrity, checks, all modules).
- Reproducible: tooling@0.8.5 packed in two separate runs gives the same `sha512-kI16R1ax...BlhFkQ==`, which is what the registry serves and the lockfiles pin.
- Still to do: the GitHub CI run on all three OSes after the coordinator pushes (the Done-when criterion).

**Release lines.** No module CHANGELOG touched: the published file contents and versions are unchanged, and only tarball bytes differ. `vsslicer/scripts` is private and has no CHANGELOG.

**Found, not fixed:** `profiles/data-orca/scripts/regenerate.mjs` `defaultRepos` resolves to `vsslicer/.reference/repos`, one `..` short since the group folders were added, so its prepack fails unless `VSS_PROFILE_REPOS` is set. Publishing here used `VSS_PROFILE_REPOS=<repo>/.reference/repos`. A fresh CI registry has no `.reference` at all, so check how CI publishes profiles-data-orca. Fixing it needs a follow-up card and a version bump.
