---
id: US18
title: "Adapters from other extensions run in the agent and secrets stay in SecretStorage"
status: reviewed
epic: VSS:E22
---

As an adapter extension author, I want my adapter loaded in the agent by module path and secrets requested back from the window, so that my adapter runs off the extension host without credentials ever being written by the agent.

## Acceptance criteria

- [ ] The agent loads `vsslicer.bambu`'s adapter by path from the registered descriptor, with version pinning; the trust model is documented (same trust as the extension host)
- [ ] Secrets are requested from the window per session and held in memory only; a test greps the agent state file and logs for the secret
- [ ] The agent log is a rotating file, shown in the window's output channel on request

## Out of scope

- Sandboxing adapters beyond the extension host's trust.
