---
id: US70
title: "Replace the STEP converter myself"
status: reviewed
epic: VSS:E37
---

As a user who cares about the licence, I want the OCCT WASM to ship as a separate file that is never bundled into our JavaScript, so that I can replace it with my own build.

## Acceptance criteria

- [ ] The WASM is a separate asset in the VSIX and the module's JavaScript contains none of it (bundle assertion)
- [ ] The package licence and the licence of the bundled OCCT version are reviewed and recorded before the first release
- [ ] Documentation says how to replace the file
- [ ] Verified only on fixtures (D5)

## Out of scope

- Building OCCT ourselves, unless the licence spike requires it
