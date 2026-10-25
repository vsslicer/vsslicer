---
id: E17
title: Add-printer flow from model, nozzle and material to a resolved printer instance
status: reviewed
initiative: I3
project: PRF
order: 7
depends_on: [E12, E15, E16]
rows: ["§13 Add-printer flow (configuration wizard)"]
---

The P0 minimum of PrusaSlicer's configuration wizard in `vsslicer.profiles`: the user picks a vendor, printer model, nozzle per toolhead, build surface and materials, optionally a connection, and gets a `printer_instance` with its resolved process open in the settings form. It closes I3's last exit criterion and is how a new user with no installed slicer starts.

## Scope
- In (written new): a wizard webview built from E15's components, plus a quick-pick fallback for the same steps; steps vendor › model › nozzle per toolhead › surface › feeder › materials (only those compatible by E11's evaluator) › connection (E16, optional, prefilled from PRN discovery when a printer extension is installed) › summary.
- In: when the chosen vendor's data is not present, offer the Orca/Bambu data package or the Prusa upstream download (D4) inline; selected materials and default process become visible in the tree (the counterpart of Prusa's installed vendor/model/variant triples).
- In: finishing creates the instance and opens the resolved default process in the form.
- Out: calibration (SLC), printer discovery itself (E21/E4), editing existing instances (E16).

## Feature-matrix rows
- §13 Add-printer flow (P0): done when a user goes from nothing to a printer instance with compatible materials and a resolved process, for a Prusa, an Orca-vendor, a Bambu and a Cura printer.

## Acceptance criteria
- [ ] Integration test per ecosystem fixture: wizard steps produce an instance whose `resolve` equals the E13 tuple oracle for the same choices.
- [ ] Material step lists exactly the materials compatible with the chosen model and nozzle (oracle: evaluator over fixture conditions, including a Prusa `nozzle_diameter[0]!=0.6` case).
- [ ] Cancelling at any step leaves no entity or secret behind.
- [ ] Offline with no vendor data: the wizard says what is missing and how to get it, and still allows a custom printer from `printer_model` defaults.
- [ ] Quick-pick path reaches the same result as the webview path (same test, two drivers).
- [ ] Manual check on the H2C: add `Bambu Lab H2C` with 0.4 nozzles and Bambu PLA Basic, connect through E21 when available; firmware version and date recorded (D5).

## Dependencies
- Needs E15 (form components), E16 (instances and secrets), E12 (data package, Prusa download).
- Exposes `vsslicer.profiles.addPrinter()` to E26 (first-run when no instance exists) and PRN (after discovery finds a printer).

## Risks and spikes
- Custom printers with no vendor data need sensible `printer_model` defaults; proposal: start from the Orca `fdm_*_common` abstract presets of the data package.
- Discovery prefill couples to PRN; kept optional through a command, so the wizard works with no printer extension installed.

## Eng review
- Scope: about 2 sprints; reuses E15's components so the wizard is mostly step logic.
- Tests catch wrong compatibility filtering (the most visible failure: offering a 0.6 mm profile for a 0.4 mm nozzle) and orphaned entities on cancel.
- Blast radius: creates new entities only.
- Zero silent failures: missing vendor data, offline download and discovery failure each have a step message.
