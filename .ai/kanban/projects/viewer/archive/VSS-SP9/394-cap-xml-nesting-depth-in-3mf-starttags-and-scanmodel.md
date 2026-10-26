---
id: 394
title: Cap XML nesting depth in 3mf startTags and scanModel
type: bug
priority: P0
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 1 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [ ] `startTags` (`3mf/src/adapters/opc/xml.ts`) and `scanModel` (`3mf/src/adapters/opc/modelScan.ts`) count depth on `opentag`/`closetag` and throw `MalformedXmlError` past 64, the same limit `readModel` uses (`readModel.ts:L39,L102-L103`)
- [ ] **Bounds:** nesting depth at most 64 in every saxes reader of the module (grep `new SaxesParser` and cover each one); work per input byte stays linear: a test at depth 10,000 in `[Content_Types].xml`, in a `.rels` part and in a model part each expects `MalformedXmlError` and asserts the count of `opentag` events seen is at most 65 (no wall time)
- [ ] Tests fail without the fix (checked by reverting it in scratch)

## Progress

- Added `MAX_XML_DEPTH = 64` to `src/adapters/opc/xml.ts`; `startTags` and `scanModel` (`modelScan.ts`) count depth on `opentag`/`closetag` and throw past 64 (becomes `MalformedXmlError` via the existing catch). `readModel` already had the cap; those are all three `new SaxesParser` sites.
- New `test/xmlDepth.test.ts`: depth 10,000 in `[Content_Types].xml` (startTags), `_rels/.rels` (startTags), scanModel and readModel each throws `MalformedXmlError` with at most 65 `opentag` events (counted by wrapping `SaxesParser.prototype.on`; no wall time). Plus depth exactly 64 still accepted.
- Verified: with the cap set to 1e9 in scratch the three startTags/scanModel tests fail (readModel passes, already capped); restored. lint, build, `node scripts/run.mjs checks` clean.
- [x] all three criteria met. No shared-file lines needed.

**Review passed (sp9-rev-vwr-394)**
- Ran in `vsslicer/modules/3mf`: `pnpm test` 162 passed (11 files), `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` exit 0.
- `new SaxesParser` sites: `xml.ts:17`, `modelScan.ts:17`, `readModel.ts:74`; all three now cap depth at 64.
- Audit probe re-run (mktemp dir, importing `src/` by absolute path, `opentag` events counted by wrapping `SaxesParser.prototype.on`), `<a>` nested to d via `openPackage`:
  - `[Content_Types].xml`: d=10k/20k/40k -> 65/65/65 events, `MalformedXmlError`.
  - `_rels/.rels`: 68/68/68 (3 from content types + 65), `MalformedXmlError`.
  - `3D/3dmodel.model` (scanModel): 70/70/70, `MalformedXmlError`.
  - Same probe with `MAX_XML_DEPTH` set to 1e9 in a copy: 10,014 / 20,014 events and no error; so the work is now constant in depth, before it grew with depth.
- `xmlDepth.test.ts` against that copy: the 3 startTags/scanModel cases fail, readModel and depth-64 cases pass, as the card says.
- Fixed in place (no behaviour change): test title `%i-deep` rendered as "NaN-deep" (the second `test.each` arg is a function); now reads `10,000-deep`.
