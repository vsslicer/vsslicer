# Provenance: broken

Synthetic, written by us (no upstream content), deterministic. Regenerate with
`node test/fixtures/make-broken.ts` from `vsslicer/modules/3mf` (Node 24, type stripping); the zip is
written by `test/support/zipBuilder.ts` and the valid base package comes from `test/support/minimalPackage.ts`.
Base: a one-triangle package (`[Content_Types].xml`, `_rels/.rels` with a start-part relationship to
`/3D/3dmodel.model`, the model). Each file breaks one thing:

| File                                 | Error class                      | How it is broken                                                                     |
| ------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| `corrupt-zip.3mf`                    | `corrupt-zip`                    | Valid zip cut 40 bytes before the end, inside the central directory.                 |
| `missing-root-model.3mf`             | `missing-root-model`             | `3D/3dmodel.model` removed; `_rels/.rels` still points at it.                        |
| `malformed-xml.3mf`                  | `malformed-xml`                  | `</mesh>` removed from the model.                                                    |
| `unsupported-required-extension.3mf` | `unsupported-required-extension` | Model has `requiredextensions="z"` with an unknown namespace.                        |
| `zip-bomb.3mf`                       | `size-cap-exceeded`              | Central directory declares 4 GiB uncompressed for the model; the data is small.      |
| `missing-production-part.3mf`        | `missing-production-part`        | A component has `p:path="/3D/Objects/missing.model"`, a part that is not in the zip. |
