---
id: US8
title: "Re-importing the catalogue keeps my edits and my spools' links"
status: reviewed
epic: VSS:E41
---

As a user who edited catalogue entries and has spools, I want a re-import to update upstream changes without overwriting my edits or breaking the link from my spools, so that refreshing the catalogue is safe.

## Acceptance criteria

- [ ] Changed upstream fields update in place; user-edited fields survive (local override marker)
- [ ] `moved_from` redirects keep spool references
- [ ] Records deleted upstream are marked stale; records referenced by a spool are kept
- [ ] An import is transactional: the new catalogue file replaces the old one only on success

## Out of scope

- Catalogue browsing UI (E43)
