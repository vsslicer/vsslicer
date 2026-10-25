---
id: D4
title: Prusa profile bundles are fetched from upstream at runtime, never redistributed
status: accepted
date: 2026-10-25
cards: [12, 17]
question: Q4
---

## Context

`PrusaSlicer-settings-*-fff` repositories carry no licence (`docs/research/licensing.md` §3,
open question 4). Q4 asked whether to ask Prusa for redistribution permission or always fetch.

## Decision

The owner answered Q4 on 2026-10-25: **"Always fetch from upstream."**

`vsslicer.profiles` downloads Prusa vendor bundles from their upstream repository at the user's
request, pinned to a commit recorded as `source.commit`, into `globalStorageUri`. Nothing from
those repositories is committed to our repositories or bundled in a VSIX; CI downloads them for
importer tests and caches them outside the repository.

## Alternatives

- Ask Prusa for written permission and bundle a snapshot: offline install and reproducible
  tests, at the cost of a permission the owner does not want to wait for.

## Consequences

- PRF's importer epic has a "download on request with pinned commit" story and no bundled Prusa
  data; Orca and Bambu trees may be bundled under D2.
- Importer golden tests pin a commit and tolerate network absence by skipping, not failing.
