// SPDX-License-Identifier: AGPL-3.0-or-later
// Stands in for the printer panel (PRN): what another extension does with the G-code preview's contract (D20).
// It uses only the public surface: `exports` (same extension host) or the commands with serialisable arguments
// (another host, Remote-SSH and WSL). shortcut: it runs in the test's extension host, because the harness loads
// one extension under development; upgrade when @vsslicer/test-vscode takes several extension folders.
import * as vscode from 'vscode';
import type { GcodePreviewApi, PrintPosition } from '../../src/presentation/commands.ts';

export type Route = 'exports' | 'commands';

/** A Moonraker `notify_status_update` becomes a byte offset; a Bambu `push_status` becomes layer and percent. */
export const positionOf = (message: unknown): PrintPosition => {
  const m = message as {
    params?: [{ virtual_sdcard: { file_position: number } }];
    print?: { layer_num: number; mc_percent: number };
  };
  if (m.params) return { fileOffset: m.params[0].virtual_sdcard.file_position };
  return { layer: m.print!.layer_num, percent: m.print!.mc_percent };
};

export const stubExtension = async (route: Route) => {
  const preview = vscode.extensions.all.find(
    (e) => (e.packageJSON as { name?: string }).name === '@vsslicer/gcode-preview',
  );
  if (!preview) throw new Error('the G-code preview is not installed');
  const api = (await preview.activate()) as GcodePreviewApi;
  // the commands carry the Uri as a string, as they do between hosts
  return route === 'exports'
    ? {
        follow: (uri: vscode.Uri, p: PrintPosition) => api.follow(uri, p),
        stop: (uri: vscode.Uri) => api.stopFollow(uri),
      }
    : {
        follow: (uri: vscode.Uri, p: PrintPosition) =>
          void vscode.commands.executeCommand('vsslicer.gcode.follow', uri.toString(), p),
        stop: (uri: vscode.Uri) => void vscode.commands.executeCommand('vsslicer.gcode.stopFollow', uri.toString()),
      };
};
