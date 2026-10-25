---
id: US6
title: "Download the OFD catalogue on request and keep using it offline"
status: reviewed
epic: VSS:E41
---

As a user, I want to download the Open Filament Database on request (command and first-run prompt) and keep working from the cache when offline, so that I can pick catalogue filaments without a network every time.

## Acceptance criteria

- [ ] Download happens only on request; the default URL is pinned and a setting overrides it
- [ ] The cache records source revision and date; offline use reads the cache
- [ ] Offline, 404, truncated gzip and a wrong content type leave the previous cache intact and show an error with a retry action
- [ ] A revert-last-import command restores the previous catalogue file

## Out of scope

- Bundled snapshot in the VSIX
