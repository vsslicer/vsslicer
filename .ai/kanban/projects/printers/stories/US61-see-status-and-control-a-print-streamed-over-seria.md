---
id: US61
title: "See status and control a print streamed over serial"
status: reviewed
epic: VSS:E59
---

As an owner of a USB-only Marlin printer, I want temperatures, progress and pause, resume and cancel in the Printers view, so that I can run a serial print like any other printer.

## Acceptance criteria

- [ ] `M105` temperatures and the streamed byte position show as normalised `PrinterStatus`; `M27` is used for SD prints
- [ ] Pause stops feeding at a line boundary and resume continues from it; cancel stops feeding, sends `M410` and the configured cancel script
- [ ] Capabilities are declared honestly: only what the connected firmware reports (`M115`) is enabled
- [ ] The streamed position is published so the G-code preview can follow the print

## Out of scope

- Camera; filament sync; Prusa Buddy and RRF over USB (unresearched).
