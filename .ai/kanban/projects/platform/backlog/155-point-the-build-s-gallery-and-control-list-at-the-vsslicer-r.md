---
id: 155
title: "Point the build's gallery and control list at the VSSlicer registry"
type: feature
priority: P3
effort: S
model: sonnet
area: [fork]
story: US66
depends_on: [148, 126]
created: 2026-10-25
---

Sets `extensionsGallery` and `controlUrl` in the overlay from the registry release settings; the default is the local instance URL for tests and the registry URL is a build variable. Hosted URL is blocked on the hosting budget; open-vsx.org is the fallback gallery when no registry URL is given.

**Code:** `src/application/gallery.ts` (repo: `vsslicer/vsslicer-build`, layer: `application`)

## Acceptance criteria

- [ ] With a registry URL variable the output `product.json` carries our `serviceUrl`, `itemUrl`, `resourceUrlTemplate` and `controlUrl`; without it, open-vsx.org values
- [ ] No Microsoft Marketplace URL appears in any case (PLT-148 validation)
- [ ] Unit tests for both variants

## Tasks

- [ ] Add the gallery settings function
- [ ] Add tests

## Progress

Not started.
