---
id: E59
title: Print over USB serial with vsslicer.printers-serial
status: draft
initiative: I10
project: PRN
order: 11
depends_on: [E20, E22, E24]
rows: ["§11 USB serial printing (Marlin)"]
---

Delivers `vsslicer.printers-serial`, an optional extension that streams G-code to Marlin printers
over USB serial (line numbers, checksums, resend), writes files to the printer's SD card over serial,
and detects long-filename support from `M115` so storage export (E24) can use long names. It is
for owners of USB-only printers, which no other slicer in the study streams to except Cura.

## Scope

In:
- `serialport` (MIT, N-API prebuilds) in a UI-kind extension shipped as platform-specific VSIXs
  (`vscode-platform.md` §1); the serial session runs in the agent so a print survives window reloads.
- Marlin protocol (`printer-connectivity.md` §3): `N<n> ... *<checksum>`, `M110`, `Resend`, `ok`
  window, `busy` keepalives, emergency commands out of band, `M105`/`M27` polling, `M115` capability
  parsing (`LONG_FILENAME`, `LFN_WRITE`, `EXTENDED_M20`).
- SD over serial: `M20`, `M23`, `M24`, `M25`, `M28`/`M29` write, `M30`; Binary File Transfer when
  advertised.
- Port enumeration as its `Discoverer`; Linux `dialout` guidance.

Out: firmware flashing (E61), Prusa Buddy and RRF over USB (unresearched), Klipper over its
socket (Moonraker covers it), Web Serial.

## Feature-matrix rows

- §11 USB serial printing (Marlin) (P2): done when a print streams to a serial emulator end to end
  with injected checksum errors recovered, and SD upload over serial works.

## Acceptance criteria

- [ ] An owner decision schedules this I10 epic.
- [ ] Contract kit passes against a Marlin serial emulator (pty pair) with injected line noise,
      resends and busy periods
- [ ] Long-filename detection from recorded `M115` replies feeds E24's sanitiser
- [ ] Platform VSIXs build in CI for the targets `serialport` prebuilds cover
- Hardware: contributor checklist only (no Marlin printer, D5).

## Dependencies

- Needs E20, E22 (agent hosting the stream), E24 (export sanitiser and SD targets).
- Exposes a serial `PrinterAdapter` to the registry.

## Risks and spikes

- Electron ABI and `serialport` prebuild coverage per VS Code release (armhf thin): CI matrix spike.
- Agent on the UI machine must own the port; Remote-SSH hosts cannot see local USB.

## Eng review

- Scope challenge: one extension, one protocol; two to three sprints. Draft until an owner decision
  orders I10 work.
