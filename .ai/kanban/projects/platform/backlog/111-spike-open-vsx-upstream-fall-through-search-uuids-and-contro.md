---
id: 111
title: "Spike: Open VSX upstream fall-through, search, UUIDs and control list on a local instance"
type: spike
priority: P2
effort: M
model: opus
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [110]
created: 2026-10-25
---

Answers how an unmodified Open VSX behaves as an upstream-registry instance before the deployment is written (E68 risk: fall-through is documented but untested by us).

**Code:** `vsslicer/modules/openvsx-registry/docs/upstream-spike.md` (module: `openvsx-registry`, layer: n/a (spike))

## Acceptance criteria

- [ ] A written result in `docs/upstream-spike.md` states, with a transcript from a local instance, how search ranking, deprecated extensions, the extension-control list and UUIDs behave for an extension we host and one we do not
- [ ] The result lists the exact `application.yml`/environment settings that work and any that do not (and the fallback: a documented limitation)
- [ ] Database search versus Elasticsearch: query latency measured on the local instance; the result says whether Elasticsearch is needed (default: not)
- [ ] No server code changed

## Tasks

- [ ] Run the server from the published image against a local PostgreSQL
- [ ] Configure the upstream registry and publish one test extension
- [ ] Record the transcript, settings and the search decision

## Progress

Not started.
