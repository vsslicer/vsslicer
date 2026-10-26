# Changelog

## Unreleased

- PRN-443: names over 1,024 characters keep their extension.
- PRN-131: name sanitiser for FAT 8.3 and long-name targets: reserved device names, Unicode folding, a 255-unit cap and linear `~n` collision resolution (`sanitiseName`, `sanitiseAll`, `uniqueName`).
- Module skeleton (`domain/`, `application/`), no public API yet.
