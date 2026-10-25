---
id: US13
title: "Know when something is wrong and recover"
status: reviewed
epic: VSS:E5
---

As a user, I want every parser diagnostic and planner flag shown, a G-code pane around the current move, and clear errors when WebGL2 or the worker fails, so nothing fails silently.

## Acceptance criteria

- [ ] All E3 diagnostics (with go to offset) and E4 flags (assumed limits, estimate, invisible macros) are visible in the side panel
- [ ] A lazy text pane shows lines read from disk by file offset around the current move
- [ ] A forced WebGL2 failure shows the message naming `disable-hardware-acceleration`; `WEBGL_lose_context` restores the view; a killed worker shows the error panel with retry while other extensions keep working

## Out of scope

- Language features in the pane (E6 hovers may be reused later)
