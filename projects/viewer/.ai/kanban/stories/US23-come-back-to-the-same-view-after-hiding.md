---
id: US23
title: "Come back to the same view after hiding the editor"
status: reviewed
epic: VSS:E10
---

As a user, I want camera and selection restored when I switch tabs, and memory freed when I close the editor, so that the viewer is pleasant and does not leak.

## Acceptance criteria

- [ ] Hiding then re-showing the editor restores camera and selection through `getState`/`setState`
- [ ] `retainContextWhenHidden` versus reload cost is measured on the 5 M fixture and chosen per size
- [ ] GPU resources are released on dispose (heap snapshot test)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
