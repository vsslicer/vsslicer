// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer. Type-only import of the VS Code API, so tests run in plain Node.
import type * as vscode from 'vscode';
import { createPanelChannel, createWebviewHtml, localResourceRoots } from '@vsslicer/webview-kit/host';
import { openPreview, type LoadPort, type PreviewSession } from '../application/preview-session.ts';
import { GCODE_VIEW_TYPE, OPEN_GCODE_SETTING, PREVIEW_VIEW_TYPE, nextAssociations } from '../domain/associations.ts';
import type { Progress, Received, TimelineCommand, ViewState } from '../domain/summary.ts';

export type Api = Pick<typeof vscode, 'window' | 'workspace' | 'Uri' | 'ConfigurationTarget'>;
type Context = Pick<vscode.ExtensionContext, 'subscriptions' | 'extensionUri'>;

/** What `activate` returns. Internal: integration tests read it; the public API is E7's. */
export interface PreviewProbe {
  /** Final state of the document opened for `uri` (a `Uri.toString()`). */
  state(uri: string): Promise<ViewState>;
  /** Resolves when a webview of `uri` has received every move buffer. */
  received(uri: string): Promise<Received>;
  /** Drives the timeline of the webview open for `uri`. */
  command(uri: string, command: TimelineCommand): void;
  /** The latest progress the webview of `uri` reported (undefined before the first). */
  progress(uri: string): Progress | undefined;
}

interface GcodeDocument extends vscode.CustomDocument {
  readonly session: PreviewSession;
}

const notLocal: LoadPort = () =>
  Promise.reject(Object.assign(new Error('Only files on this machine can be previewed yet.'), { code: 'not-local' }));

const deferred = <T>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

export const registerPreview = (context: Context, api: Api, load: LoadPort): PreviewProbe => {
  const states = new Map<string, PreviewSession>();
  const open = new Map<
    string,
    { channel: ReturnType<typeof createPanelChannel>; session: PreviewSession; progress?: Progress }
  >();
  const received = new Map<string, ReturnType<typeof deferred<Received>>>();
  const receivedFor = (uri: string) => received.get(uri) ?? received.set(uri, deferred<Received>()).get(uri)!;

  const provider: vscode.CustomReadonlyEditorProvider<GcodeDocument> = {
    openCustomDocument(uri) {
      // fsPath is read by the worker with Node fs; other schemes need workspace.fs (later)
      const session = openPreview(uri.fsPath, uri.scheme === 'file' ? load : notLocal);
      const key = uri.toString();
      states.set(key, session);
      const dispose = () => {
        session.dispose();
        states.delete(key);
        // a reopened file may already have registered under the same key
        if (open.get(key)?.session === session) open.delete(key);
        received.delete(key);
      };
      return { uri, session, dispose };
    },
    resolveCustomEditor(document, panel) {
      const { webview } = panel;
      webview.options = {
        enableScripts: true,
        localResourceRoots: localResourceRoots(context.extensionUri, ['dist'], api.Uri.joinPath),
      };
      const setHtml = () =>
        (webview.html = createWebviewHtml({
          webview,
          scripts: [webview.asWebviewUri(api.Uri.joinPath(context.extensionUri, 'dist', 'webview.js'))],
          body: '<main id="root"></main>',
          title: 'G-code Preview',
        }));
      // subscribe before the HTML is set: the webview's hello is not retried
      const channel = createPanelChannel(panel);
      const entry = { channel, session: document.session };
      open.set(document.uri.toString(), entry);
      const stop = document.session.serve(channel, {
        onMismatch: setHtml,
        onReceived: (r) => receivedFor(document.uri.toString()).resolve(r),
        onProgress: (p) => Object.assign(entry, { progress: p }),
      });
      panel.onDidDispose(stop);
      setHtml();
    },
  };

  const options = { webviewOptions: { retainContextWhenHidden: true }, supportsMultipleEditorsPerDocument: false };
  const syncAssociations = async () => {
    const workbench = api.workspace.getConfiguration('workbench');
    const current = workbench.inspect<Record<string, string>>('editorAssociations')?.globalValue ?? {};
    const next = nextAssociations(current, api.workspace.getConfiguration().get<boolean>(OPEN_GCODE_SETTING, false));
    if (next) await workbench.update('editorAssociations', next, api.ConfigurationTarget.Global);
  };
  context.subscriptions.push(
    api.window.registerCustomEditorProvider(PREVIEW_VIEW_TYPE, provider, options),
    api.window.registerCustomEditorProvider(GCODE_VIEW_TYPE, provider, options),
    api.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(OPEN_GCODE_SETTING)) void syncAssociations();
    }),
  );
  void syncAssociations();

  return {
    state: (uri) => states.get(uri)?.state ?? Promise.reject(new Error(`${uri} is not open in the preview`)),
    received: (uri) => receivedFor(uri).promise,
    command(uri, command) {
      const c = open.get(uri);
      if (!c) throw new Error(`${uri} has no preview open`);
      c.session.command(c.channel, command);
    },
    progress: (uri) => open.get(uri)?.progress,
  };
};
