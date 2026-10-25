---
id: US60
title: "Stream a print to a Marlin printer over USB serial and recover from line noise"
status: reviewed
epic: VSS:E59
---

As an owner of a USB-only Marlin printer, I want to stream G-code from VS Code over the serial port with line numbers, checksums and resend handling, so that a print finishes even when the cable corrupts a line.

## Acceptance criteria

- [ ] A print streams to a Marlin serial emulator end to end (line numbers, `*checksum`, `M110`, the `ok` window)
- [ ] Injected checksum errors, dropped characters and `Resend:` requests are recovered and the printed lines match the source file
- [ ] `busy` keepalives hold off the timeout; a silent printer ends the job with a typed `timeout` error
- [ ] Emergency commands (`M112`, `M108`, `M410`) bypass the send window

## Out of scope

- Binary File Transfer (US62); firmware flashing (E61); Klipper over its socket; Web Serial.
