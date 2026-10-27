---
id: US71
title: "The VSSlicer build replaces Accounts, stock Settings and Extensions with its own, and drops Run and Debug and Source Control"
status: draft
epic: VSS:E69
---

As a VSSlicer build user, I want no Accounts menu, a VSSlicer settings page in place of the stock one, an extensions view that lists only the VSSlicer marketplace (D24) with no MCP servers, and no Run and Debug or Source Control, so that the build shows only what a printing editor needs (D23 step 2). The Explorer stays.

## Acceptance criteria

- [ ] Accounts is absent from the activity bar and the title bar, and its context-menu toggle is gone (PLT-211)
- [ ] The gear menu's Settings opens the VSSlicer settings page; its Extensions entry opens the VSSlicer extensions view (PLT-212)
- [ ] The stock Extensions container, its MCP views and the MCP gallery are absent (PLT-213)
- [ ] Run and Debug and Source Control are absent from the activity bar, the View menu and the command palette's open commands (PLT-219, PLT-220)
- [ ] Each removal is a `product.json` entry or one of three small patches (`docs/research/vscodium-build.md` §4)
