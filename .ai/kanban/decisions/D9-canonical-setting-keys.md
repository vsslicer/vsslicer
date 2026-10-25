---
id: D9
title: The unified profile schema uses OrcaSlicer's setting key names as canonical
status: proposed
date: 2026-10-25
cards: [23]
---

## Context

Roadmap owner question 7 and `docs/research/profiles.md` (open questions) ask whether the unified
schema keeps its own descriptive keys or adopts an existing slicer's names. The PRF epic worker
(E11, the schema and settings catalogue) needs the answer before the catalogue script runs.

## Decision (proposed)

Orca's key names are canonical in `@vsslicer/profiles`. Reasons: the first engine adapter emits
Orca preset JSON (E26, E27), so the hot path needs no renaming; Orca's 804 FFF keys cover Bambu
Studio except about 100 Bambu-only keys and include the 303 PrusaSlicer keys under Bambu's names
(`feature-matrix.md` §1 origin table); under D2 we may reuse Orca's key list and defaults as
data. Prusa, Cura and Bambu-only keys map onto Orca names where one exists and keep a prefixed
key (`prusa.`, `cura.`, `bambu.`) where none does, so native round trips stay lossless (E13).

## Alternatives

- Own descriptive names: cleaner documentation, but every engine adapter renames every key and
  every imported profile needs a mapping table we would maintain ourselves.
- PrusaSlicer 3.0 names: the oldest lineage, but the first engine is Orca and Prusa 3.0 is alpha.

## Consequences

- The settings catalogue (E11) is generated from Orca's key list plus the prefixed extras; our
  own labels and descriptions are written new, in our words.
- If the owner picks differently, E11's catalogue script changes its source table; the schema
  shape and the importers do not change.
