---
id: 209
title: "Read the VSSlicer registry's extension list over the Open VSX API"
type: feature
priority: P1
effort: M
model: sonnet
area: [fork, registry]
story: US71
milestone: "VSS:M6"
depends_on: [206, 126]
created: 2026-10-27
---

The adapter behind the VSSlicer extensions view: query our registry (E68) only, never open-vsx.org fall-through and never the Microsoft Marketplace. Registry responses are untrusted input; bounds are named here (estimation rule 25).

**Code:** `vsslicer/modules/apps/workbench/src/adapters/registry-client.ts` and the `ExtensionCatalogue` port in `src/application/` (module: `workbench-extension`, layer: `adapters`)

## Acceptance criteria

- [ ] `search(query)`, `get(namespace, name)` and `download(version)` against the registry URL from `vsslicer.workbench.registryUrl` (default the build's gallery URL); only the `vsslicer` namespace and namespaces on an allow-list setting are returned
- [ ] Responses over 5 MB, more than 500 results, or a VSIX over the registry's size limit are refused with a typed error; timeouts are typed errors too
- [ ] No MCP server entries: results whose manifest contributes `mcpServerDefinitionProviders` or that are MCP gallery items are dropped
- [ ] Tests against the local `openvsx-registry` stack (PLT-126) or recorded responses from it; no request to any other host (checked by the test's fetch stub)

## Tasks

- [ ] Port and client
- [ ] Filters and bounds
- [ ] Tests

## Progress

Not started.
