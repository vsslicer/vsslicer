---
id: US46
title: "Pick the best block in the preview"
status: reviewed
epic: VSS:E62
---

As a user who printed a calibration, I want to pick the best block and see its value, so that I do not have to compute which layer range held which setting.

## Acceptance criteria

- [ ] After slicing, a quick pick lists the blocks with their values and layer ranges taken from the parser's layer table; choosing one scrolls the preview to those layers
- [ ] The mapping from a picked layer or block to its value is unit tested against the sweep definition, including the first and last block
- [ ] Cancelling the pick changes nothing

## Out of scope

- A webview that prints the result on the preview canvas
