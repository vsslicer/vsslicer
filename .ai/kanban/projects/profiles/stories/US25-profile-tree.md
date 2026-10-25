---
id: US25
title: "A user browses vendors, printers, nozzles, materials and processes in a tree"
status: reviewed
epic: VSS:E14
---

A user opens the profiles view and sees vendor, printer model, nozzle, materials, processes and printer instances, can filter to what is compatible with a printer instance, and the store never stalls the editor.

## Acceptance criteria

- [ ] The tree shows the expected counts for an imported Orca vendor and a fixture Prusa bundle; abstract entities are greyed; the inheritance chain shows on expand
- [ ] The compatibility filter hides incompatible materials
- [ ] With a 14 420-file vendor tree indexed the extension host never stalls above 200 ms; a worker crash restarts it with an error message
- [ ] The multi-root folder rule is written down after the spike

## Out of scope

- The settings form (E15).
