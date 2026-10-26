# @vsslicer/printer-discovery

Printer discovery (mDNS, SSDP, network scan).

Status: scaffold, version 0.0.0. Any dependency on `@vsslicer/printer-api` is not declared yet because `printer-api` is unreleased (0.0.0).

Layers (`src/`): `domain` (pure), `application` (use cases and ports). Add `adapters` and `presentation` when needed. Imports point inward only (enforced by `@vsslicer/tooling`'s lint).
