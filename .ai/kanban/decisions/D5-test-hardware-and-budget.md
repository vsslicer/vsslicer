---
id: D5
title: Test hardware is one Bambu H2C; no budget for signing, CI minutes or a lawyer
status: accepted
date: 2026-10-25
cards: [17]
question: Q5
---

## Context

Q5 asked which printers and firmware the project can test on and whether there is budget for an
Apple Developer ID, a Windows signing certificate and fork CI.

## Decision

The owner answered Q5 on 2026-10-25: **"Bambu H2C. No budget yet, testing only."**

- The only hardware oracle is a Bambu H2C. Every other printer family is tested against
  recorded fixtures, emulators and public simulators (OctoPrint virtual printer, a fake MQTT
  broker, a local MJPEG server), with a manual hardware checklist left for contributors.
- No paid services: no code signing, no notarisation, no hosted registry, no paid CI, no
  counsel. Free CI (GitHub Actions public repository minutes) only.

## Alternatives

- Buy or borrow a Klipper machine and a Prusa: covers I4's second adapter family on hardware.
  Revisit when budget exists.

## Consequences

- D3's Bambu-first order is also the only order that can be verified on hardware now.
- I11 (fork, signed installers) cannot ship until a signing budget exists; it stays last and
  its milestone date is a placeholder.
- Every epic's acceptance criteria say what is verified on the H2C and what only on fixtures.
- Firmware behaviour on the H2C is recorded with the firmware version and date, because Bambu
  changes LAN behaviour between releases.
