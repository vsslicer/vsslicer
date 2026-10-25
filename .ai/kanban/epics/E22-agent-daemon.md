---
id: E22
title: Hold printer sessions across windows in the vsslicer-agent daemon
status: reviewed
initiative: I4
project: PRN
order: 3
depends_on: [E20, E21, E19]
rows: []
---

Delivers `vsslicer-agent`, a local background process that owns printer sessions (MQTT, WebSocket,
polling loops) so they survive window reloads, are shared by every VS Code window, and keep network
and parse work off the extension host. `vsslicer.printers` becomes a thin client of it. It is for
users with more than one window or long prints, and for E25 to E47, which need one session and one
queue per printer instead of one per window (`vscode-platform.md` §1 Long-running processes,
Implications 3).

## Scope

In:
- `vsslicer-agent` (new code, Node, AGPL-3.0-or-later) shipped inside `vsslicer.printers` and run with
  the VS Code Electron binary as Node (`ELECTRON_RUN_AS_NODE=1`, `process.execPath`), so no separate
  runtime is installed.
- Start on first need, detached; single instance per user via a lock file; local socket (Unix domain
  socket, Windows named pipe) in the user runtime directory; random token in a 0600 file for
  authentication; protocol version handshake.
- JSON-RPC over `@vsslicer/agent-protocol` (E19): session open/close, status subscription fan-out
  to many windows, job commands, upload streaming, adapter loading by module path from registered
  adapter extensions, secret requests back to the window (secrets stay in SecretStorage; the agent
  holds them in memory only).
- Lifecycle: idle shutdown when no window and no active job for N minutes; restart on crash with
  sessions re-opened; `deactivate()` only detaches (well under the 5 s budget).
- Setting `vsslicer.printers.useAgent` (default on after the epic, off while it is in progress):
  off keeps E20/E2's in-process sessions.
- Logs to a rotating file and to the window's output channel on request.

Out: camera proxy (E38 adds it to this process), upload queue (E25), fleet queue (E47), running on a
remote host (the agent always runs on the UI machine).

## Feature-matrix rows

None. This is the non-row platform work behind I4's exit criterion "daemon survives a window reload,
serves two windows on one session, and shuts down within the 5 s `deactivate` budget".

## Acceptance criteria

- [ ] Integration test (`@vscode/test-electron`, two windows): both windows show the same session;
      one fake-adapter connection is open (counted at the fake server), not two
- [ ] Window reload test: the session and a running fake job survive; status resumes in under 2 s
- [ ] `deactivate` completes in under 1 s with an active session (timed in the test)
- [ ] Crash test: kill the agent; the extension restarts it, sessions re-open, the tree view shows
      a "reconnected" state and no unhandled error
- [ ] Security tests: a client without the token is refused; the socket and token file are not
      readable by another user (POSIX permissions test; Windows pipe ACL checked manually)
- [ ] Version skew test: an older extension and a newer agent negotiate or the agent is restarted
- [ ] With `useAgent` off, the E20/E2 test suites still pass (rollback path)
- [ ] On the H2C: one MQTT session across two windows over a full print (manual checklist, firmware
      recorded)
- Fixtures and the fake adapter cover everything else (D5).

## Dependencies

- Needs E20 (API, registry), E21 (first adapter to host), E19 (`@vsslicer/agent-protocol`
  schema; PRN contributes the printer methods to it).
- Exposes the agent process and its RPC to E25 (upload queue, live feed), E38 (camera loopback
  proxy), E46 and E47 (history writer, queue), E42 (status events reach FIL through the
  registry, not the agent directly).

## Risks and spikes

- Running Electron as Node from an extension: spike (1-2 days) on macOS, Windows and Linux with the
  current VS Code; fallback is a `node` on PATH or a bundled Node, decided by the spike
  (`slicing-engine-embedding.md` lists the same unknown for the engine child process).
- Adapters loaded in the agent from other extensions' folders: version pinning and the trust model
  (the agent runs code from installed extensions, same trust as the extension host); spike with
  `vsslicer.bambu` loaded by path.
- Multiple VS Code installs (Stable, Insiders, VSCodium) sharing one agent: the socket name includes
  the product name; sharing across products is out.
- macOS App Nap or Windows sleep dropping sockets: reconnect logic in adapters is tested by the
  fake adapter's disconnect fixture.

## Eng review

- Scope challenge: the agent is the smallest thing that meets the I4 daemon criterion; the camera
  proxy and queues are kept out so this epic is two to three sprints.
- Boring technology: a child process and a socket. No new runtime unless the spike forces it.
- Blast radius: an agent crash loses live status for every window; the restart path and the
  in-process fallback (`useAgent` off) bound it. Heavy work (MQTT parsing, uploads) leaves the host.
- Zero silent failures: agent start failure shows an error with the log path and falls back to
  in-process sessions with a warning.
- Changed after review: added the version-skew and two-product tests; made the setting the rollback.
