---
id: E68
title: Publish the VSSlicer marketplace as a static index on GitHub (D24)
status: draft
initiative: I11
project: PLT
order: 5
depends_on: [E1]
rows: []
---

Delivers VSSlicer's own extension marketplace as static files (D24, proposed): each VSSlicer extension release attaches its VSIX to a GitHub Release; the public repo `vsslicer/vsslicer-marketplace` generates one `index.json` from those releases and publishes it on GitHub Pages; the VSSlicer extensions view (E69, `apps/workbench`) reads it and installs VSIX files. No server, no database, no hosting bill. It extends the §16 In-app extension marketplace row that E1 owns. Research: `docs/research/vscodium-build.md` §5.

Re-planned 2026-10-27 (owner: build now; coordinator proposal). The earlier plan, an unmodified Eclipse Open VSX server with open-vsx.org as upstream, is parked with its cards (PLT-112, 113, 114, 115, 116, 117, 119, 120, 122, 123, 124, 130, 131): D24 was accepted on 2026-10-27, so they can be deleted. New cards: PLT-222 (schema), PLT-223 (generator).

## Scope

- **In:** the repo `vsslicer/vsslicer-marketplace`: the `index.json` schema and model (domain), a generator that reads GitHub Releases and writes `index.json` (application, adapters), a Pages workflow, and a Pages page with the takedown procedure and contact. In this repo: the release workflow attaches each extension's VSIX to its GitHub Release and triggers the generator.
- **Registry policy** (`licensing.md` §2 (e)), enforced by the generator: a licence expression is required; a copyleft extension needs a source link; only the `vsslicer` namespace is accepted (roadmap question 20's default); every VSIX has a `sha256` in the index.
- **Licence:** generator and schema AGPL-3.0-or-later. Hosting AGPL VSIX files is distribution by us, satisfied by the source link and tarball every VSSlicer release already carries (D2 item 4).
- **Out:** a gallery endpoint (`/extensionquery`), so stock VS Code and VSCodium can't use it as a gallery; a serverless adapter for that is a parked spike (PLT-111); mirroring open-vsx.org or the Microsoft Marketplace; signing beyond `sha256`.

## Feature-matrix rows

None owned. Extends §16 In-app extension marketplace (owned by E1).

## Acceptance criteria

- [ ] `index.json` validates against its schema in CI, and the generator rebuilds it byte-identically from the same releases.
- [ ] A release of a VSSlicer extension attaches its VSIX and, through the generator, appears in `index.json` on Pages with the right version, dependencies, licence and `sha256`.
- [ ] The generator refuses an extension without a licence expression, a copyleft one without a repository link, and one outside the `vsslicer` namespace (tests on fixtures).
- [ ] The VSSlicer extensions view (PLT-209/210) installs an extension from the published `index.json` and refuses a VSIX whose `sha256` differs.
- [ ] The takedown procedure and contact are on the Pages site.

Verified in CI on fixtures and against the published Pages site; no hardware involved.

## Dependencies

- Needs: E1 (release workflow), the GitHub remote for this repo and the two new repos (owner-created 2026-10-27).
- Exposes: the `index.json` URL to E69's extensions view.

## Risks and spikes

- **No gallery:** no public catalogue in the build; users install other extensions as VSIX files. Accepted in D24.
- **GitHub API limits:** the generator reads releases with the workflow token; unauthenticated rate limits only matter locally.
- **Pages caching:** Pages serves with a short cache; the view re-fetches on open and on "Check for updates".

## Eng review

- Scope challenge: static files replace a running service; nothing to back up but the Git repo.
- Reversibility: the parked Open VSX cards come back if D24 is rejected; the extensions view reads one URL, so switching it to a gallery adapter later changes one adapter.
- Zero silent failures: the generator fails the workflow by extension name; the view refuses a checksum mismatch.
