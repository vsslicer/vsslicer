---
id: 24
title: "Spike: trusted publishing to Open VSX and the Microsoft marketplace"
type: spike
priority: P0
effort: L
model: opus
area: [publishing]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP8"
depends_on: [7, 21]
created: 2026-10-25
---

Unverified whether open-vsx.org enables OIDC publishing and whether Microsoft's federated credential needs a paid Azure subscription (D5: no paid services). Publish a throwaway pre-release of the pack from a test tag with each method.

## Acceptance criteria

- [ ] Each method (OIDC to Open VSX, `vsce publish --azure-credential`) tried and the outcome, cost and limits written in `.reference/notes/`
- [ ] A decision proposed on the VSS board: use trusted publishing, or scoped tokens in GitHub secrets with a recorded expiry and a calendar reminder
- [ ] The throwaway pre-release is unpublished or superseded and noted

## Tasks

- [ ] Ask the owner for access to the accounts
- [ ] Try OIDC with open-vsx.org
- [ ] Try Entra federated credential
- [ ] Write note and propose decision

## Progress

Not started.
