---
id: US9
title: "A Bambu owner pauses, resumes and stops a print"
status: reviewed
epic: VSS:E21
---

As a Bambu owner in Developer Mode, I want pause, resume and stop from the Printers view, so that I can control a running print without going to the printer.

## Acceptance criteria

- [ ] `print.pause/resume/stop` messages are asserted against the fake broker, and a command rejected by the printer surfaces as a `PrinterError`
- [ ] Control is available only when the capability table and `fun` flag allow it
- [ ] Verified on the H2C in US14

## Out of scope

- Print speed, light and calibration commands (E61).
