---
id: E68
title: Run a self-hosted Open VSX registry with open-vsx.org as upstream
status: draft
initiative: I11
project: PLT
order: 5
depends_on: [E1]
rows: []
---

Delivers VSSlicer's own extension registry: an unmodified Eclipse Open VSX server configured as an upstream-registry instance, holding the VSSlicer extensions and falling through to open-vsx.org for everything else, so users of the VSSlicer build (E69) keep the public catalogue while getting our extensions from our gallery (`vscode-platform.md` §5; roadmap "Marketplace plan", phase 11). It extends the §16 In-app extension marketplace row that E1 owns. Hosting costs money, so it is gated on a budget decision (D5, D10); until then open-vsx.org and the Microsoft marketplace are the only registries.

## Scope

- **In:** a deployment in this repository (`distro/registry/`): Docker Compose for the Open VSX server, web UI, PostgreSQL and database search (Elasticsearch only if database search proves too slow), GitHub OAuth2 login, local-disk or one object-store backend; configuration for the upstream registry (open-vsx.org), stable extension UUIDs fetched from upstream, `ovsx.publishing.max-content-size` and per-namespace overrides sized for platform-specific engine VSIX files, signature archives (`ovsx.integrity.key-pair`), and the extension-control list (`doc/configuration.md`, cited in `vscode-platform.md` §5). A third publish target in the E1 release workflow. Backup and restore of the database and storage.
- **Registry policy** (`licensing.md` §2 (e); roadmap "Marketplace plan"): refuse uploads without a licence expression; require a source link for copyleft extensions; a notice-and-takedown procedure and contact; whether third-party uploads are accepted at all is an owner decision (roadmap question 20), default "VSSlicer namespace only".
- **Licence:** the server is EPL-2.0 and run unmodified, which imposes nothing on hosted extensions; hosting AGPL VSIX files is distribution by us, satisfied by the source link and tarball every VSSlicer release already carries (D2 item 4).
- **Code origin:** no server code written or ported; configuration and scripts only.
- **Out:** a modified Open VSX server; mirroring or pointing at the Microsoft Marketplace (forbidden by its Terms of Use, `licensing.md` §4); editor-side signature enforcement (stock VS Code checks only Microsoft signatures and VSCodium disables verification, `vscode-platform.md` §5; that would be fork code in E69 if ever wanted); `coder/code-marketplace` (kept as the air-gapped alternative).

## Feature-matrix rows

None owned. Extends §16 In-app extension marketplace (owned by E1) with the own registry.

## Acceptance criteria

- [ ] `docker compose up` from a clean checkout yields a registry that serves the VSSlicer extensions published by the release workflow and, for a public extension we do not host, falls through to open-vsx.org.
- [ ] Gallery tests from VSCodium pointed at the registry with `VSCODE_GALLERY_*` variables: search finds `vsslicer` extensions, install works, a newly published version is offered as an update, and a public extension installs through fall-through.
- [ ] Extension UUIDs match those on open-vsx.org for the same extensions (regression caught: auto-update breaking because of random UUIDs, `vscode-platform.md` §5 "UUIDs").
- [ ] Every published version has a signature archive and `ovsx verify` passes on it in CI.
- [ ] An upload without a licence expression is refused; a copyleft upload without a repository link is refused (both as CI tests against a local instance).
- [ ] A platform-specific VSIX at the configured size limit uploads; one over it is refused with the registry's error shown in the release job.
- [ ] Backup then restore into an empty instance serves the same extensions and versions (rehearsal recorded).
- [ ] The takedown procedure and contact are published on the registry's about page.
- [ ] An owner budget decision (D10 gate) and a decision on third-party uploads exist before anything is deployed publicly.

Verified on a local instance in CI and on the hosted instance once budget exists; no hardware involved.

## Dependencies

- Needs: E1 (release workflow, publishing credentials pattern).
- Exposes: the registry URL and `controlUrl` to E69 for `product.json#extensionsGallery`; a third publish target to every project's release.

## Risks and spikes

- **Budget and operations** (D5): hosting, backups and moderation are ongoing costs; nothing is deployed publicly without an owner decision.
- **Upstream fall-through behaviour** for search ranking, deprecations and the control list is documented but untested by us: spike with a local instance before writing the deployment.
- **Owner tension** between wanting an own marketplace and `vscode-platform.md` Implications 7 ("not needed while open-vsx.org exists"); this epic exists only because I11 asks for it.

## Eng review

- Scope challenge: the smallest registry is unmodified Open VSX with upstream fall-through; no custom UI, no server changes. Considered merging with E69 (the build); kept separate because the registry is a running service with its own tests and can be deployed before the build exists (VSCodium accepts gallery environment variables).
- Blast radius: a registry outage blocks installs and updates for VSSlicer-build users only; stock VS Code and VSCodium users keep the public marketplaces. Rollback: the build's gallery can be pointed back at open-vsx.org.
- Zero silent failures: refused uploads fail the release job by name; UUID drift and signature failures are CI tests.
