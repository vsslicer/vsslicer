---
id: 51
title: Define the error model and stable `data.kind` strings
type: feature
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US43
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [49]
created: 2026-10-25
---

The fixed set of application error codes with stable `data.kind` strings, shared by server and client. Pure code, verified by unit tests.

**Code:** `vsslicer/modules/agent-protocol/src/domain/...` (module: `agent-protocol`, layer: `domain`)

## Acceptance criteria

- [x] `Unauthorized`, `NotFound`, `Busy`, `Timeout`, `AdapterError`, `Cancelled`, `AgentVersionMismatch` map to a fixed code range and kind; a test pins the table so a change fails
- [x] JSON-RPC standard codes (`ParseError`, `InvalidRequest`, `MethodNotFound`, `InvalidParams`, `InternalError`) are included with their kinds
- [x] `AgentError` carries code, kind, message and optional data, and serialises/deserialises losslessly

## Tasks

- [x] Write the error table and `AgentError`
- [x] Write the pinning test

## Progress

Not started.

Review (sp8-reviewer-20, 08:16): FAIL
Numbering: no fixed application code numbers exist in docs/research or .ai/plans (grepped for AgentVersionMismatch, -3200x); -32001..-32007 inside the JSON-RPC server-error range -32000..-32099 is accepted. Table, pin test, lint, build, checks pass.
Findings (AgentError.fromJSON, src/domain/errors.ts, fromJSON), probed in scratch:
1. fromJSON(null) throws a raw TypeError; fromJSON of a string, number or array returns an AgentError with code undefined and message "". Fix: validate the input is a non-array object, code is an integer, message is a string; otherwise return AgentError.of('InvalidRequest', ...) or throw one documented error.
2. A non-string message is coerced ("[object Object]") and a non-number code is kept ("a"), so the typed WireError contract is violated on the wire. Same fix as 1.
3. data as a string is spread into {"0":"a","1":"b",...}. Fix: accept data only when it is a plain non-array object, else drop it.
4. Lossless claim: an AgentError whose data contains its own kind key loses it in toJSON (kind overwrites), so round trip changes data. Reject or namespace a "kind" key in the constructor, and add a test.
5. No size bound on message or data (50 MB message accepted). Acceptable if the transport enforces a frame limit; state that in a comment or cap it here.
Prototype keys checked: JSON.parse'd __proto__ and constructor stay own data properties, no pollution (fine). Add hostile-input tests for 1-3.

Review (sp8-reviewer-23, 2026-10-26 08:25): PASS
Re-review after fix round 1. The fix note (PLT-51-fix) did not land in this card: `board.py note` writes to .ai/local/taskboard/activity.jsonl only, so this Progress had only the FAIL until now. Ran: `pnpm test` (11 pass), `pnpm lint`, `pnpm build` in agent-protocol, `node scripts/run.mjs checks` (exit 0), and a scratch probe. src/index.ts untouched (coordinator adds MAX_MESSAGE_LENGTH).
- 1, 2 fixed: `fromJSON(unknown)` (errors.ts:85-95) returns internal_error for null, undefined, strings, numbers, arrays, class instances, `new String` messages, NaN, Infinity, 1.5, `'a'`, and a JSON.parse'd top-level `__proto__`; a null-prototype object is accepted.
- 3 fixed: string, number, array, null, boolean and Date `data` are dropped; own `__proto__`/`constructor` keys stay own data, no pollution, and round-trip.
- 4 fixed: `data.kind` throws RangeError in the constructor (errors.ts:62), own or inherited; a JSON.parse'd own `__proto__` holding `kind` is correctly not treated as `kind`. fromJSON strips the wire kind, so it never trips this.
- 5 fixed: message capped at 4096 with the marker (errors.ts:40-60); a 50 MB message takes 6 ms. Double round trip of a 9000-char message with nested data is byte-identical.
Non-blocking: (a) `Number.isInteger` accepts 1e300 and -0; `Number.isSafeInteger` would be tighter (errors.ts:87). (b) Fields are read twice, so a getter can pass the check and then return a string (code became `'evil'`), and a throwing getter makes fromJSON throw despite the doc; JSON.parse output cannot carry getters, so this is not reachable from the wire. Reading `w.code`/`w.message`/`w.data` once into locals would fix both. (c) The 4096 cut can leave a lone high surrogate before the marker (`'a'.repeat(4083)+'😀'.repeat(10)`); JSON escapes it, but it shows as U+FFFD.
