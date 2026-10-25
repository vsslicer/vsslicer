---
id: US64
title: "A tagged release publishes to the VSSlicer registry as well, and the hosted registry goes live once a budget exists"
status: reviewed
epic: VSS:E68
---

As a maintainer, I want the release workflow to publish to the registry as a third target and the registry to run on a host, so that VSSlicer users get our extensions from our gallery. This is blocked on a hosting budget decision (D5, D10); until then the local instance is the only registry and open-vsx.org plus the Microsoft marketplace stay the public ones.

## Acceptance criteria

- [ ] The release workflow has a third publish target that fails red naming the registry and its error, tested against the local instance in CI
- [ ] An owner budget decision (D10 gate) exists and says yes or no to hosting before anything is deployed publicly; on no, the target stays pointed at the local instance
- [ ] With a yes: the hosted instance serves the gallery tests from US60 and the takedown page from US63
- [ ] `openvsx-registry` is released to the local registry as 0.1.0 (local stack) and 0.2.0 (hosted deployment)

## Out of scope

- Choosing the host or provider; paid CI.
