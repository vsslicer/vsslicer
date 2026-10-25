---
id: US41
title: "The wizard copes with missing vendor data, offline use and cancelling"
status: reviewed
epic: VSS:E17
---

A user who is offline or has no vendor data is told what is missing and how to get it, can still add a custom printer, and can cancel at any step without leaving anything behind.

## Acceptance criteria

- [ ] With no vendor data and offline the wizard says what is missing and allows a custom printer from `printer_model` defaults
- [ ] Cancelling at each step leaves no entity or secret; a failure while finishing rolls back
- [ ] Missing data, offline download and discovery failure each have a step message

## Out of scope

- Downloading data automatically without being asked.
