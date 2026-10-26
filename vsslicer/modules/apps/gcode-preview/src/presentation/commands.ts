// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer: the cross-extension contract (GCP-50, D20). The same three functions are the extension's
// `exports` and the commands vsslicer.gcode.open/.follow/.stopFollow; commands because a ui-kind extension (the
// printer panel) runs in another extension host under Remote-SSH and WSL, where `exports` cannot reach. Every
// argument is untrusted and validated here. Type-only import of the VS Code API, so tests run in plain Node.
import type * as vscode from 'vscode';
import { createFollower, type Follower } from '../application/follow.ts';
import { GCODE_VIEW_TYPE, PREVIEW_VIEW_TYPE } from '../domain/associations.ts';
import { fileKind } from '../domain/file-kind.ts';
import { parsePosition, type PrintPosition } from '../domain/print-position.ts';
import type { PreviewProbe } from './provider.ts';

export type { PrintPosition, ResolvedBy, Revealed } from '../domain/print-position.ts';

export const GCODE_PREVIEW_API_VERSION = 1;

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
  follow(uri: UriArg, position: PrintPosition): void;
  /** Ends following `uri`: a position still waiting is dropped. */
  stopFollow(uri: UriArg): void;
}

export type CommandsApi = Pick<typeof vscode, 'commands' | 'Uri'>;
type Context = Pick<vscode.ExtensionContext, 'subscriptions'>;

const MAX_URI = 8192;

export const registerCommands = (context: Context, api: CommandsApi, probe: PreviewProbe): GcodePreviewApi => {
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

  const followers = new Map<string, Follower>();
  const stop = (key: string) => {
    followers.get(key)?.stop();
    followers.delete(key);
  };

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
    follow(u, position) {
      const uri = toUri(u);
      const p = parsePosition(position);
      const key = uri.toString();
      let f = followers.get(key);
      if (!f) {
        let first = true;
        const follower = createFollower(
          async (pos) => {
            if (first && !probe.session(key)) await openUri(uri, {});
            first = false;
            const session = probe.session(key);
            if (!session) throw new Error(`${key} is no longer open`);
            return session.reveal(pos);
          },
          // a closed preview ends the follow; a position outside the file is skipped and the feed goes on
          () => !probe.session(key) && followers.get(key) === follower && stop(key),
        );
        followers.set(key, (f = follower));
      }
      f.push(p);
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
