---
id: US67
title: "Add an Elegoo SDCP printer"
status: reviewed
epic: VSS:E60
---

As an owner of an Elegoo printer that speaks SDCP V3.0.0, I want to find it on the network, upload a file in chunks and start, pause and stop the print, so that I can use it from VS Code without the vendor app.

## Acceptance criteria

- [ ] SDCP passes the printer-api contract kit on recorded fixtures (discovery reply, status, attributes, errors, a chunked upload with MD5)
- [ ] UDP `M99999` discovery on port 3000 lists the printer through the `Discoverer` port
- [ ] Upload sends 1 MB packets with `S-File-MD5`, `Offset` and `Uuid`; an MD5 mismatch or a refused file gives a typed `fileRejected` error
- [ ] Start, pause, continue and stop use commands 128 to 131 over the WebSocket on port 3030; status and attributes normalise to `PrinterStatus`

## Out of scope

- Resin file validation; video stream (RTSP) and timelapse commands; history list.
