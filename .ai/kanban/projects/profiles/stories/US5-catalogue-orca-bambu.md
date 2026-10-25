---
id: US5
title: "The catalogue lists every Orca and Bambu Studio setting key"
status: reviewed
epic: VSS:E11
---

A maintainer runs a script and gets one canonical entry for each of Orca's 804 FFF keys and the Bambu-only keys, with our own labels (or ported text with a provenance line).

## Acceptance criteria

- [ ] The generator is deterministic and reads only pinned upstream sources (Orca@09aa0114, Bambu@79df7ae)
- [ ] Orca yields 804 typed entries; every Bambu FFF key is canonical or `bambu.`-prefixed
- [ ] Ported labels and tooltips carry a `Ported from repo@commit:path` line per entry

## Out of scope

- Reading native preset files (E12).
