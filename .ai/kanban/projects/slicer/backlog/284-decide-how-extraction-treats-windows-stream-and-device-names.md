---
id: 284
title: Decide how extraction treats Windows stream and device names
type: bug
priority: P1
effort: S
model: opus
sprint: "VSS:SP15"
created: 2026-10-28
---

Found by SLC-283 (notes: `.reference/notes/SLC-283-windows-symlink-escape.md`). In `vsslicer/modules/slicer/runtime/src/adapters/extract-archive.ts`, on Windows:

- an entry name containing `:` writes an NTFS alternate data stream (stays inside the folder, but hides data);
- reserved device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9`, `LPT1`–`LPT9`, with or without extension on older Windows) open devices instead of files.

Refusing them on every OS could reject real archives (a file named `aux.c`). Decide: refuse only on win32, refuse everywhere, or rename on Windows; implement with tests that run the Windows rule on any OS. Module `slicer-runtime`, layer adapters. Patch bump + CHANGELOG.