# Changelog

## Unreleased

- PRN-132: `writeFileSafely` streams into a unique temp file in the target directory, fsyncs it, renames it, then fsyncs the directory; failures and aborts remove the temp file, and target errors become `PrinterError` (`refused` for a full or read-only target). Depends on `@vsslicer/printer-api` ^0.1.0.

- PRN-443: names over 1,024 characters keep their extension.
- PRN-131: name sanitiser for FAT 8.3 and long-name targets: reserved device names, Unicode folding, a 255-unit cap and linear `~n` collision resolution (`sanitiseName`, `sanitiseAll`, `uniqueName`).
- Module skeleton (`domain/`, `application/`), no public API yet.
