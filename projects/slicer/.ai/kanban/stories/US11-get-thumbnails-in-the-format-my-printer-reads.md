---
id: US11
title: "Get thumbnails in the format my printer reads"
status: reviewed
epic: VSS:E27
---

As a Klipper or Prusa user, I want thumbnails injected into the G-code in the formats my printer profile names, so that my printer's screen and Mainsail show the model.

## Acceptance criteria

- [ ] PNG, JPG, QOI, BTT TFT and ColPic are written; lossless formats decode back to the rendered image; every format is read by `@vsslicer/gcode`'s thumbnail extraction (or leaves the documented marker)
- [ ] ColPic and BTT TFT match fixture files produced by Orca; if ported, files carry the notice and a `Ported from` line (D2)
- [ ] Sizes and counts come from the printer profile's `thumbnails_format`; absent, the default is one 300x300 PNG with a warning
- [ ] Thumbnails are rendered by `vsslicer.project` `renderThumbnail(plate)`, not by the engine

## Out of scope

- Thumbnail rendering itself (VWR)
