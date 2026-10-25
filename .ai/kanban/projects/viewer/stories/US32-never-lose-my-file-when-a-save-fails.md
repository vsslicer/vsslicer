---
id: US32
title: "Never lose my file when a save fails"
status: reviewed
epic: VSS:E31
---

As a user saving a project, I want a failed save to leave the file I opened exactly as it was, so that a full disk, a permission error or a concurrent change never costs me a project.

## Acceptance criteria

- [ ] The writer writes to a temporary file and renames it over the target
- [ ] Disk full, permission denied and file changed on disk since open each leave the original intact and give a named error; each case is tested
- [ ] The temp-file and rename test runs on all three CI platforms, including the network-drive rename caveat noted in the test
- [ ] Verified only on fixtures (D5)

## Out of scope

- Detecting external changes while editing (E32)
