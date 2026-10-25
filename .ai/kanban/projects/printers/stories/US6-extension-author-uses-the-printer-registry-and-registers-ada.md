---
id: US6
title: "An extension author uses the printer registry and registers an adapter"
status: reviewed
epic: VSS:E20
---

As the author of an adapter extension, the slicer, the G-code preview or the profiles extension, I want an exported `PrinterRegistry` (list, status events, upload, job, files, cameras), a way to register an adapter, and the list of registered host types, so that I can send to or watch a printer, and the `printer_instance` form can offer exactly the adapters that exist.

## Acceptance criteria

- [ ] An adapter extension registers an adapter with `vsslicer.printers`; the registry exports list, status events, `upload(uri, opts)`, `job`, `files` and `cameras()` with versioned types
- [ ] The registry exposes the registered host types and resolves an instance's connection through the profiles extension, replacing the static `host_type` list of the printer_instance entity; a secret is returned only to the adapter that registered the host type
- [ ] A workspace-kind extension can reach the registry under Remote-SSH, by exports or, if the spike shows they do not cross hosts, by commands with serialisable arguments
- [ ] API review: the exports are documented and released as `printers-extension@0.1.0`

## Out of scope

- Adapters themselves; the profiles-side form change (PRF owns the list display).
