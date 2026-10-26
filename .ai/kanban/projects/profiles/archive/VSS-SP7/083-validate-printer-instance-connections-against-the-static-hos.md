---
id: 83
title: Validate printer_instance connections against the static host_type list
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US34
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-b
depends_on: [3]
created: 2026-10-25
---

In M2 `host_type` is a plain string checked against a static list of the D3 values (bambu-lan, moonraker, octoprint, prusalink, duet); E20 will later read instances from here and register adapters, so E16 does not wait for it.

**Code:** `vsslicer/modules/profile-api/src/domain/entities/printer-instance/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] `connection {host_type, url, secret_ref}` validates for each of the five host types and fails for an unknown one with the path `connection.host_type`
- [x] Toolhead slots and nozzles resolve per extruder for an H2C dual-nozzle fixture (slot 0 and slot 1 each name a nozzle entity)
- [x] A `connection` carrying a credential-like property (`password`, `apikey`, `access_code`, `token`) fails validation
- [x] Bounds (rule 25): host and URL strings over 2,048 characters are refused; validation is linear (no backtracking regex)
- [x] Hostile test with an over-long and a pathological host string

## Tasks

- [x] Add the host-type list and validation
- [x] Resolve toolhead slots
- [x] Tests

## Progress

Done. `validateConnection` (host_type against the static D3 list, credential-like keys, 2,048-character bound, no regex) and `resolveToolheads` (slot to nozzle entity, in slot order; throws on a duplicate slot or unknown nozzle) in `src/domain/entities/printer-instance/`.

Files: `src/domain/entities/printer-instance/printer-instance.ts`, `.../index.ts`, `test/printer-instance.test.ts`.
Verified in profile-api: `pnpm lint` clean, `pnpm test` 348 passed, `pnpm build` ok. Tests: all five host types, unknown/non-string host_type at `connection.host_type`, password/apikey/access_code/token (any case), 2,049 vs 2,048 chars, a pathological string timing check, H2C two-nozzle slots.
Not done / notes: the JSON Schema (`src/domain/schema/`) was NOT changed: it already rejects credentials via additionalProperties and the card does not require `host_type` or length there (host_type stays a plain string per the card). The H2C test builds nozzles inline from the names in `test/fixtures/multitool/bambu-h2c.json`.

### Coordinator: shared-file changes

`src/index.ts`: add
```ts
export { HOST_TYPES, MAX_CONNECTION_STRING, resolveToolheads, validateConnection } from './domain/entities/printer-instance/index.ts';
export type { ConnectionIssue, HostType, ResolvedToolhead } from './domain/entities/printer-instance/index.ts';
```

Review (sp7-rev-d): PASS. Host types match D3 exactly (bambu-lan, moonraker, octoprint, prusalink, duet; case-sensitive). Probed in `/private/tmp/claude-501/sp7w.IRyk/rev-d/probe.ts`: unknown and wrong-case host_type give `connection.host_type`; `password`/`apiKey` give the credential message, and any other extra key (`api_key`, `__proto__` from JSON.parse) fails as unknown property, so no credential key can pass; 2,048 accepted and 2,049 refused for `url`; 10 M-char host_type in about 0 ms, 200 k keys in 120 ms (linear, no regex). H2C slot test present. Ran `pnpm lint`/`test`/`build` (only failures are in other cards' catalogue files). Note, not a failure: credentials embedded in the URL (`http://user:pass@host`) are not refused; a follow-up card for E16 if wanted.
