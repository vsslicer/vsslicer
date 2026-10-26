---
id: 180
title: Encode bundle manifest only near the byte limit
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP8"
docs: [.ai/audits/SP7-audit.md]
created: 2026-10-26
---

SP7 audit finding 1 (`.ai/audits/SP7-audit.md`). Package profile-api, layer domain (`src/domain/bundle/bundle.ts:L106-L107`).

`parseBundleStructure` UTF-8 encodes every manifest under the limit, though the comment says the byte count is checked only near the limit.

## Criteria
- Encode only when `text.length * 3 > BUNDLE_LIMITS.maxBytes`, as the audit describes.
- A test that fails before the fix is not possible for a pure efficiency change; add tests that a manifest of 1/3 the limit in 3-byte characters passes and one just over the limit in bytes fails (`too-large`).
- Rule 25 bound unchanged: `BUNDLE_LIMITS.maxBytes`.
