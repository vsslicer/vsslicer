---
id: 22
title: "Spike: VSIX size of the Orca and Bambu data package"
type: spike
priority: P0
effort: S
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-22
depends_on: [1]
created: 2026-10-25
---

Measures the compressed size of the 30 MB of JSON and decides between shipping it inside `vsslicer.profiles` or as a separate data extension.

**Code:** `vsslicer/fixtures/profile-research/data-package-size.md` (layer: n/a (spike notes))

## Acceptance criteria

- [x] Compressed sizes measured for Orca@09aa0114 (23.4 MB JSON) and Bambu@79df7ae (6.5 MB JSON) as a VSIX payload
- [x] A decision with numbers: inside the extension or a separate package, against the PLT-21 VSIX budget

## Tasks

- [x] Pack the trees into a test VSIX
- [x] Record the sizes
- [x] Write the decision

## Progress

Done. Measured both trees (18,009 JSON files, 29.9 MiB): zip -6 14.0 MB (Orca 11.2, Bambu 2.6), tar.gz 2.6 MB, tar.xz 1.2 MB. Decision: separate data extension, since 14 MB is about 70x the 200 KB PLT-21 budget. Files: vsslicer/fixtures/profile-research/data-package-size.md, .reference/notes/PRF-22-vsix-size.md. No shared-file changes.


Review (sp7-rev-spikes): PASS. Re-measured Bambu@79df7ae resources/profiles *.json in scratch (deleted after): 3,589 files, 6,821,989 B, zip -6 2,629,488 B, zip -9 2,624,149 B, exactly the report's figures. Arithmetic checked (14,034,696 B / 200 KB = 68.5x; tar.xz 5.9x; minified -3.9%). PLT-21 budget: CONTRIBUTING.md:98 and tooling bin/vsslicer-package.mjs:77-78 (sizeBudgetKB required, per extension); openvsx@373af42 doc/configuration.md:36-41 512 MB default confirmed. Decision follows (per-extension budget is configurable, so the cadence/licence-separation reasons 2-3 carry it; reason 1 alone would not). Doc fix in place (no behaviour): sourced the 'vsce zips at deflate level 6' claim (yazl@2.5.1:index.js:148, zlib default). Note for the follow-up card: decision item 3 says `extensionDependencies` yet 'works without it'; extensionDependencies makes the data extension mandatory, so the implementing card must pick the optional lookup.
