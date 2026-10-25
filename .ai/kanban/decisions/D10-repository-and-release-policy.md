---
id: D10
title: "Public GitHub monorepo, DCO, unsigned Linux builds allowed, hosted registry gated on budget"
status: accepted
date: 2026-10-25
cards: [27]
---

## Context

The platform epics (E1 monorepo and publishing, E68 self-hosted Open VSX, E69 VSCodium build)
need answers only the owner can give: where the code lives, the contributor policy (roadmap
question 18), whether unsigned builds may ship before a signing budget exists (D5), and whether
the hosted registry waits for money.

## Decision (proposed)

1. **One public GitHub repository** (monorepo, roadmap question 33) under the owner's account or
   an organisation, AGPL-3.0-or-later (D2). Public because free CI minutes and the AGPL source
   link both assume it. The AGPL engine extension no longer needs its own repository (D2).
2. **DCO** (`Signed-off-by`), not a CLA; copyright stays with each contributor.
3. **Unsigned Linux builds** of the VSSlicer distribution may be released before a signing
   budget exists; macOS and Windows installers wait for D5's budget.
4. **The self-hosted Open VSX (E68) is gated on a budget decision**; until then open-vsx.org and
   the Microsoft marketplace are the only registries (D1).
5. **Product name and trademark check** (roadmap question 4) are needed before E69 starts; the
   working name stays VSSlicer.

## Alternatives

Private repository with paid CI; CLA with assigned copyright; signed builds only; registry from
day one. Each costs money or time the owner said does not exist yet (D5).

## Consequences

- E1 configures GitHub Actions, Changesets and DCO checks; E69 ships Linux first.
- If the owner picks differently, E1's CI target changes; nothing else in the plan moves.
