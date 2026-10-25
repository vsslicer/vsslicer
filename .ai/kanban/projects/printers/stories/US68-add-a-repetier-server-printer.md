---
id: US68
title: "Add a Repetier-Server printer"
status: reviewed
epic: VSS:E60
---

As an owner of a printer managed by Repetier-Server, I want to upload a file and control jobs from VS Code, so that I can use it like any other host.

## Acceptance criteria

- [ ] Repetier passes the contract kit on recorded fixtures (state, temperature events, upload, job start, stop)
- [ ] Auth works with the `x-api-key` header; the session key from the WebSocket is used for events
- [ ] Upload is a multipart `POST /printer/model/<slug>?a=upload`; start copies the model to the queue and starts the job; there is no pause action, so the capability is off
- [ ] Webcam URLs are not handled here

## Out of scope

- Camera; Repetier-Host; the full action list beyond what the cards name.
