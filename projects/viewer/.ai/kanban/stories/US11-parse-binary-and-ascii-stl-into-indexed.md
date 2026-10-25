---
id: US11
title: "Parse binary and ASCII STL into indexed meshes"
status: reviewed
epic: VSS:E9
---

As a user opening an STL, I want binary and ASCII files read correctly, so that models from any exporter load with the right geometry.

## Acceptance criteria

- [ ] Binary, ASCII, ASCII with CRLF and odd whitespace, and a binary STL whose header begins with `solid` parse to the expected triangle counts and bounding boxes; three.js loaders are the oracle for counts
- [ ] Declared triangle count is checked against file length
- [ ] Truncated binary STL, declared count larger than the file and NaN or infinite coordinates each have a fixture and a typed error
- [ ] Verified only on fixtures (D5)

## Out of scope

- Mesh repair (E36)
