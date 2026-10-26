---
id: D21
title: "Cards that waited on owner-gated cards test with local inputs instead"
status: proposed
date: 2026-10-26
cards: [VWR-13, VWR-21, VWR-25, VWR-27, VWR-28, VWR-70, PRF-25, PRF-27, PRF-30, PRF-32, PRF-40, PRF-130]
---

## Context

Owner answers Q7/Q13 and Q19 moved the remote, CI, marketplace and owner-exported fixture cards to
M7 (Owner setup), out of the sprints. Twelve M2 cards depended on one of them only for a test input
or a CI cache: the 3mf dialect readers on VWR-10, 11 and 12 (owner slicer exports), the profile
importers on PRF-23 (pinned vendor packs in a CI cache), VWR-70 on PLT-18 (Linux CI snapshots).
About 400 later cards hang off those chains.

## Decision (applied by the SP9 coordinator; reversible)

The SP9 coordinator removed the owner-gated edge from those twelve cards. Each tests with synthetic
fixtures, or with the local `.reference` clones, and skips with a stated reason when they are
absent; the owner-gated check lands with the M7 card. The edges of later cards (M3 to M6) that
depend on PLT-9, PLT-16, PLT-25 or PLT-26 are left for the planner of the sprint that reaches them.

## Alternatives

- Keep the edges: M2's viewer and profile import chains stay blocked until the owner sets up the
  remote and exports fixtures.
- Move the whole dependent chains to M7: about 400 cards, most of the product.
