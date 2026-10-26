// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer: the cross-extension contract (GCP-50, D20). The same three functions are the extension's
// `exports` and the commands vsslicer.gcode.open/.follow/.stopFollow; commands because a ui-kind extension (the
// printer panel) runs in another extension host under Remote-SSH and WSL, where `exports` cannot reach. Every
// argument is untrusted and validated here. Type-only import of the VS Code API, so tests run in plain Node.
import type * as vscode from 'vscode';
import { fileMismatch, parseFileCheck } from '../application/file-check.ts';
import { createFollower, createWatchdog, realTimers, type Follower, type Timers } from '../application/follow.ts';
import { GCODE_VIEW_TYPE, PREVIEW_VIEW_TYPE } from '../domain/associations.ts';
import { fileKind } from '../domain/file-kind.ts';
import type { FileCheck } from '../application/file-check.ts';
import { parsePosition, type PrintPosition } from '../domain/print-position.ts';
import type { PreviewProbe } from './provider.ts';

export type { PrintPosition, ResolvedBy, Revealed } from '../domain/print-position.ts';

export type { FileCheck } from '../application/file-check.ts';

export const GCODE_PREVIEW_API_VERSION = 1;

/** No position for this long ends a follow with a message. */
export const STALE_MS = 60_000;

export const Command = {
  open: 'vsslicer.gcode.open',
  follow: 'vsslicer.gcode.follow',
  stopFollow: 'vsslicer.gcode.stopFollow',
} as const;

/** A file to preview: a `Uri`, or its `toString()` (the form that crosses extension hosts unchanged). */
export type UriArg = string | vscode.Uri;

export interface OpenOptions {
  /** Plate of a `.gcode.3mf`, 1..1000 (default: the first). */
  plate?: number;
}

/** What `activate` exports; the commands take the same serialisable arguments. */
export interface GcodePreviewApi {
  readonly version: typeof GCODE_PREVIEW_API_VERSION;
  /** Opens the preview of `uri` (and the plate, once loaded). */
  open(uri: UriArg, options?: OpenOptions): Promise<void>;
  /** Shows `position` in the preview of `uri`, opening it on the first call; later calls coalesce (newest wins). */
  follow(uri: UriArg, position: PrintPosition, file?: FileCheck): void;
  /**
   * Ends following `uri`: a position still waiting is dropped. A follow also ends, with a message, when no position
   * arrives for a minute, or when the first call's `file` (the printer's size and/or MD5) differs from the file here.
   */
  stopFollow(uri: UriArg): void;
}

export type CommandsApi = Pick<typeof vscode, 'commands' | 'Uri' | 'window' | 'workspace'>;
type Context = Pick<vscode.ExtensionContext, 'subscriptions'>;

const MAX_URI = 8192;

export const registerCommands = (
  context: Context,
  api: CommandsApi,
  probe: PreviewProbe,
  { staleMs = STALE_MS, timers = realTimers }: { staleMs?: number; timers?: Timers } = {},
): GcodePreviewApi => {
  const toUri = (u: unknown): vscode.Uri => {
    if (u instanceof api.Uri) return u;
    if (typeof u !== 'string' || !u || u.length > MAX_URI)
      throw new TypeError(`uri must be a Uri or a URI string of at most ${MAX_URI} characters`);
    return api.Uri.parse(u, true); // strict: throws on a string without a scheme
  };
  const parseOptions = (o: unknown): OpenOptions => {
    if (o === undefined) return {};
    if (typeof o !== 'object' || o === null || Array.isArray(o)) throw new TypeError('options must be an object');
    const unknown = Object.keys(o).find((k) => k !== 'plate');
    if (unknown !== undefined) throw new TypeError(`options has an unknown field: ${unknown.slice(0, 64)}`);
    const { plate } = o as OpenOptions;
    if (plate !== undefined && !(Number.isInteger(plate) && plate >= 1 && plate <= 1000))
      throw new TypeError('plate must be an integer in 1..1000');
    return { plate };
  };

  const openUri = async (uri: vscode.Uri, { plate }: OpenOptions): Promise<void> => {
    const kind = fileKind(uri.path);
    if (!kind) throw new TypeError(`not a G-code file: ${uri.toString().slice(0, 256)}`);
    await api.commands.executeCommand('vscode.openWith', uri, kind === 'gcode' ? GCODE_VIEW_TYPE : PREVIEW_VIEW_TYPE);
    const session = probe.session(uri.toString());
    // setPlate ignores a plate before the file's plate list is known, so the first load is awaited
    if (session && plate !== undefined) await session.state.then(() => session.setPlate(plate));
  };

  const followers = new Map<string, { follower: Follower; dog: { kick(): void; cancel(): void } }>();
  const stop = (key: string) => {
    const f = followers.get(key);
    f?.follower.stop();
    f?.dog.cancel();
    followers.delete(key);
  };
  const warn = (message: string) => void Promise.resolve(api.window.showWarningMessage(message)).catch(() => {});

  const self: GcodePreviewApi = {
    version: GCODE_PREVIEW_API_VERSION,
    open: (uri, options) => {
      // validation throws before any await, so a bad argument rejects without opening anything
      try {
        return openUri(toUri(uri), parseOptions(options));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    follow(u, position, file) {
      const uri = toUri(u);
      const p = parsePosition(position);
      const expect = file === undefined ? undefined : parseFileCheck(file);
      const key = uri.toString();
      let f = followers.get(key);
      if (!f) {
        let first = true;
        let outOfRange = false; // one notification per follow, not per reveal
        const name = uri.path.slice(-100);
        const current = () => followers.get(key)?.follower === follower; // a stopped follow stays quiet
        let checked = !expect; // the printer's file is compared once, on the first reveal
        const mismatch = async () => {
          try {
            const { size } = await api.workspace.fs.stat(uri);
            return await fileMismatch(expect!, { size, read: () => Promise.resolve(api.workspace.fs.readFile(uri)) });
          } catch (e) {
            return `the file could not be checked: ${String((e as Error)?.message ?? e).slice(0, 200)}`;
          }
        };
        const follower: Follower = createFollower(
          async (pos) => {
            if (first && !probe.session(key)) await openUri(uri, {});
            first = false;
            const session = probe.session(key);
            if (!session) throw new Error(`${key} is no longer open`);
            if (!checked) {
              checked = true;
              const bad = await mismatch();
              if (!current()) return;
              if (bad) return (stop(key), warn(`Stopped following ${name}: ${bad}.`));
            }
            const r = await session.reveal(pos);
            if (r.warning && current()) warn(r.warning);
            return r;
          },
          // a closed preview ends the follow quietly; any other error (a position outside the file) is shown, the feed goes on
          (e) => {
            if (!current()) return;
            if (!probe.session(key)) stop(key);
            else if (!outOfRange) {
              outOfRange = true;
              warn(`Cannot follow: ${String((e as Error)?.message ?? e).slice(0, 300)}`);
            }
          },
        );
        const dog = createWatchdog(
          staleMs,
          () => (stop(key), warn(`Stopped following ${name}: no position for ${Math.round(staleMs / 1000)} s.`)),
          timers,
        );
        followers.set(key, (f = { follower, dog }));
      }
      f.dog.kick();
      f.follower.push(p);
    },
    stopFollow: (u) => stop(toUri(u).toString()),
  };

  context.subscriptions.push(
    api.commands.registerCommand(Command.open, self.open),
    api.commands.registerCommand(Command.follow, self.follow),
    api.commands.registerCommand(Command.stopFollow, self.stopFollow),
    { dispose: () => [...followers.keys()].forEach(stop) },
  );
  return self;
};
