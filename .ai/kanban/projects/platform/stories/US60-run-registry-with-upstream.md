---
id: US60
title: "A maintainer runs a registry that serves the VSSlicer extensions and falls through to open-vsx.org"
status: reviewed
epic: VSS:E68
---

As a maintainer, I want one `docker compose up` to give me an unmodified Open VSX server with the VSSlicer extensions and open-vsx.org behind it, so that users of the VSSlicer build keep the public catalogue while getting our extensions from our gallery.

## Acceptance criteria

- [ ] `docker compose up` from a clean checkout yields a registry (server, web UI, PostgreSQL, database search, local-disk storage, GitHub OAuth2 login) that serves a published extension and, for a public extension we do not host, falls through to open-vsx.org
- [ ] Gallery tests from VSCodium pointed at the registry with `VSCODE_GALLERY_*` variables: search finds `vsslicer` extensions, install works, a newly published version is offered as an update, a public extension installs through fall-through
- [ ] Extension UUIDs match those on open-vsx.org for the same extensions (regression test for random UUIDs breaking auto-update)
- [ ] The extension-control list is served at the `controlUrl` the build will use
- [ ] A spike with a local instance documents upstream fall-through behaviour (search ranking, deprecations, control list) before the deployment is written

## Out of scope

- A modified Open VSX server; Elasticsearch unless database search proves too slow; mirroring the Microsoft Marketplace.
