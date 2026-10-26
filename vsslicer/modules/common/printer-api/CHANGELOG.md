# Changelog

## 0.1.1

- Fixed: a status push may name a heater or tray whose id was cut to the length cap (PRN-446); a `null` or non-object list item is refused with `InvalidStatusError(field, "invalidValue")`, and a non-array list error names the list (PRN-447).

## 0.1.0

- PRN-4: normalised `PrinterStatus` value objects with `createPrinterStatus` (caps, named truncations, duplicate-key refusal) and `mergeStatus` (keyed partial pushes; a base cut stays until the patch replaces it, rule 28).
- PRN-5: 27 capability flags with a domain `MUTATING_FLAGS` set, `readOnly`/`requiresMode` annotations, `can()` and `isReadOnly`/`readOnlyReason`.
- PRN-3: `PrinterError` with eight stable kinds, `isPrinterError`, and the seven auth scheme descriptors (`AUTH_SCHEMES`).
- Module skeleton, no public API yet.
