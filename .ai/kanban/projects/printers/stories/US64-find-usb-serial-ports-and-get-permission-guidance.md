---
id: US64
title: "Find USB serial ports and get permission guidance"
status: reviewed
epic: VSS:E59
---

As a user adding a serial printer, I want the Add printer form to list the serial ports on my computer and explain permission errors, so that I do not have to guess device names or search for `dialout`.

## Acceptance criteria

- [ ] The serial module is a `Discoverer` that lists ports with vendor and product ids and a readable label for known boards, and never opens a port to probe it
- [ ] A permission error on Linux names the `dialout` or `uucp` group and the command to join it
- [ ] In a Remote-SSH, WSL or dev-container window the form says the ports belong to the local machine and why the list may be empty

## Out of scope

- Auto-detecting baud rates by opening every port.
