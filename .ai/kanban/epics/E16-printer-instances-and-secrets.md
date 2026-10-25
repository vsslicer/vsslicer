---
id: E16
title: Add printer_instance entities with connections and credentials in SecretStorage
status: reviewed
initiative: I3
project: PRF
order: 6
depends_on: [E13, E14, E20]
rows: ["§13 Physical printer (instance with a host connection)"]
---

The user's own printers as `printer_instance` entities in `vsslicer.profiles`: which model, which nozzle on which toolhead, which surface and feeder, and how to reach it (host type, address, and a `secret_ref` into VS Code SecretStorage). The printer extensions (PRN) connect through these instances, and the slicer resolves profiles for them. Credentials never land in profile files, unlike PrusaSlicer 2.9's plain-text physical printer INI files.

## Scope
- In (written new): create, edit and delete instances (tree items and form fields from E14/E5); `connection {host_type, url, secret_ref}` with `host_type` values taken from the adapters E20 registers (Bambu LAN with serial and access code first, D3; then Moonraker, OctoPrint, PrusaLink, Duet); credentials stored with `context.secrets` under the `secret_ref`.
- In: import of existing physical printers from PrusaSlicer 2.9 `physical_printer/*.ini` and 3.0 JSON, Orca user machine presets and Cura machine instances: entity into the store, credential (`printhost_apikey`, `printhost_password`, access code) into SecretStorage; the source files are not touched.
- In: `getConnection(instanceId)` in the extension API, returning the credential to the calling extension; export of an instance to native formats without secrets.
- Out: talking to printers (PRN), discovery (E23, used by E17), the wizard (E17).

## Feature-matrix rows
- §13 Physical printer (P0): done when instances can be created and imported, resolve through `ProfileStore.resolve`, and their credentials exist only in SecretStorage.

## Acceptance criteria
- [ ] Secrets-never-in-files test: import fixture physical printers with known credentials, then scan the workspace, `globalStorageUri` and every exported file for those strings; zero hits.
- [ ] A deleted instance deletes its secret; a missing secret (another machine, cleared keychain) gives "credential missing" with a re-enter action, never an empty password sent.
- [ ] Instances validate against E11's schema; toolhead slots and nozzles resolve per extruder for an H2C dual-nozzle fixture.
- [ ] Import from each source fixture keeps model, nozzle and host; unknown host types import with a diagnostic and no connection.
- [ ] On the H2C (once E21 exists): an imported or created instance connects through `getConnection`; firmware version and date recorded in the test log (D5). Before that, a fake MQTT broker fixture from E20.

## Dependencies
- Needs E13, E14; E20 for the `host_type` registry and connection shape (agreed both ways: E20 reads instances from here).
- Exposes `printer_instance` entities and `getConnection` to E20/E2/E3/E4, and instances to E26/E2 as the slicing target.

## Risks and spikes
- Extension API exposure: any installed extension can call `getConnection`. This is VS Code's normal trust model (one extension host); documented, and the API returns secrets only for instances whose `host_type` the calling adapter registered.
- Where a remote workspace keeps secrets: SecretStorage follows the UI side; spike checks behaviour with Remote-SSH before release.
- Orca and Cura store connection fields in different places (unverified for Orca's user machine presets); spike on fixtures.

## Eng review
- Scope: about 2 sprints, the lower bound. Could merge with E17; kept apart because PRN depends on instances and secrets, not on the wizard, and E20 can start against this epic earlier.
- The secrets scan test is the regression guard for the most serious failure (credential leak into a git-tracked workspace).
- Reversibility: deleting an instance removes entity and secret; import is additive.
- Zero silent failures: missing secret, unknown host type and keychain errors each have a message and test.
