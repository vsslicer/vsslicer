---
id: US95
title: "Measure distances, angles, diameters and plane separations"
status: reviewed
epic: VSS:E55
---

As a user, I want to hover a model, pick two features and read the distance, angle, diameter or plane separation, so that I can check a model before printing.

## Acceptance criteria

- [ ] Point, edge, circle and plane features are highlighted under the cursor and picked in pairs
- [ ] Measurements on the calibration cube, cylinder and angled block fixtures are correct within 0.01 mm and 0.1 degree (§3 Measure)
- [ ] Measurements account for the object's transform and units; measuring never changes the model
- [ ] Verified only on fixtures (D5)

## Out of scope

- Assembly measuring and alignment (P3, E56)
