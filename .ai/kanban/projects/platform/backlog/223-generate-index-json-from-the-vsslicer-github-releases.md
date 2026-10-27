---
id: 223
title: Generate index.json from the VSSlicer GitHub Releases
type: feature
priority: P0
effort: M
model: sonnet
area: [registry]
story: US72
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [222, 118]
created: 2026-10-27
---

The generator behind the static marketplace (D24): it lists the GitHub Releases of the configured repositories, takes each `*.vsix` asset and its `.sha256`, reads the VSIX manifest, and writes `index.json`.

**Code:** `src/application/generate.ts` (use case and the `ReleaseSource` port), `src/adapters/github-releases.ts`, `src/adapters/vsix-manifest.ts` (repo: `vsslicer/vsslicer-marketplace`, layers: `application`, `adapters`)

## Acceptance criteria

- [ ] `pnpm generate` reads `sources.json` (repositories to scan) and writes `index.json` that validates against PLT-222's schema
- [ ] The VSIX manifest (`extension/package.json`) supplies engines, dependencies, licence and repository; a VSIX whose checksum differs from its `.sha256` asset fails by name
- [ ] The `ReleaseSource` port has a fixture adapter; tests run offline on fixture releases and VSIX files
- [ ] Bounds: at most 200 MB per VSIX, 500 entries per index; over them fails by name (estimation rule 25)
- [ ] The registry policy (PLT-118) runs on every entry

## Tasks

- [ ] Port, fixture adapter, GitHub adapter
- [ ] Manifest reader
- [ ] Use case and tests
