---
id: US9
title: A user without working WebGL sees a clear message, and a lost GPU context recovers by itself
status: reviewed
epic: VSS:E2
---

A viewer author asks the kit for a WebGL2 context and gets either a working context or a structured failure with its cause for display; a lost context is rebuilt from CPU-side arrays without help from the host.

## Acceptance criteria

- [ ] In Playwright, Chromium started with WebGL disabled shows the kit's failure message with its cause; no blank canvas, no uncaught error
- [ ] Forcing `WEBGL_lose_context.loseContext()` then `restoreContext()` redraws the same image (snapshot match) without a new message from the host

## Out of scope

- A software-rendering fallback.
