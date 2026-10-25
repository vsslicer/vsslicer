---
id: US61
title: "A publisher gets a named refusal when an upload breaks the registry policy, and a platform VSIX at the size limit uploads"
status: reviewed
epic: VSS:E68
---

As a release engineer, I want the registry to refuse uploads without a licence expression, copyleft uploads without a repository link, and VSIX files over the size limit, with the registry's error shown in the release job, so that nothing unlicensed is distributed and failures are never silent.

## Acceptance criteria

- [ ] An upload without a licence expression is refused; a copyleft upload without a repository link is refused (both as CI tests against a local instance)
- [ ] A platform-specific VSIX at the configured `ovsx.publishing.max-content-size` (with per-namespace override) uploads; one over it is refused with the registry's error shown in the release job
- [ ] The registry accepts the `vsslicer` namespace only by default; third-party uploads stay off until the owner decides otherwise (roadmap question 20)
- [ ] The policy decision (namespace-only default, third-party uploads) is recorded before anything is deployed publicly

## Out of scope

- Third-party upload moderation tooling; changing the server to enforce the policy.
