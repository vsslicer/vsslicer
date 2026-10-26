# Changelog

## 0.1.0

- PRN-4: normalised `PrinterStatus` value objects with `createPrinterStatus` (caps, named truncations, duplicate-key refusal) and `mergeStatus` (keyed partial pushes; a base cut stays until the patch replaces it, rule 28).
- PRN-5: 27 capability flags with a domain `MUTATING_FLAGS` set, `readOnly`/`requiresMode` annotations, `can()` and `isReadOnly`/`readOnlyReason`.
- PRN-3: `PrinterError` with eight stable kinds, `isPrinterError`, and the seven auth scheme descriptors (`AUTH_SCHEMES`).
- Module skeleton, no public API yet.
