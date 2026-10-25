---
id: US91
title: "Compute adaptive and smoothed layer heights"
status: reviewed
epic: VSS:E54
---

As a user, I want the layer heights chosen from the surface curvature and smoothed, so that curved parts print finer and vertical walls print faster.

## Acceptance criteria

- [ ] The adaptive profile (with a quality value) and the smoothed profile (with a radius) agree with Orca's recorded profiles within 0.01 mm per sample on the fixtures
- [ ] Profiles stay within the minimum, maximum and first layer height of the plate's own printer
- [ ] Adaptive and smooth are undoable commands and cancel changes nothing
- [ ] The port from Slicing.cpp carries notices and a `Ported from` line (§3 Variable layer height editor)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Cura's automatic adaptive layers (an engine setting)
