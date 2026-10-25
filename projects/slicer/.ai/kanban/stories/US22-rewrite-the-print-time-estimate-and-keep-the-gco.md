---
id: US22
title: "Rewrite the print time estimate and keep the .gcode.3mf valid"
status: reviewed
epic: VSS:E29
---

As a Klipper user, I want klipper_estimator to rewrite the time estimate in my G-code and the final archive to stay consistent, so that my printer shows the right time.

## Acceptance criteria

- [ ] A fixture script rewrites the time estimate; the final `.gcode.3mf` MD5 matches the processed G-code
- [ ] The pipeline order is engine, post-processing, thumbnails, assembly, commit, and a failure at any step leaves `.vsslicer/sliced/` untouched

## Out of scope

- Bundling klipper_estimator
