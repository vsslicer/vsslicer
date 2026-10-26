// SPDX-License-Identifier: AGPL-3.0-or-later
import type * as vscode from 'vscode';
import { completionsAt, hoverAt, unknownCommands } from '../application/features.ts';
import { resolveFlavour, type CatalogueIndex } from '../domain/lookup.ts';
import { featuresAvailable, OVERSIZE_REASON } from '../domain/size.ts';
import { flavourOf, type Api as StatusApi } from './status.ts';

export type Api = Pick<
  typeof vscode,
  | 'window'
  | 'workspace'
  | 'languages'
  | 'commands'
  | 'Range'
  | 'Hover'
  | 'MarkdownString'
  | 'CompletionItem'
  | 'CompletionItemKind'
  | 'Diagnostic'
  | 'DiagnosticSeverity'
  | 'StatusBarAlignment'
  | 'TabInputText'
  | 'Uri'
> &
  StatusApi;

export const PREVIEW_VIEW_TYPE = 'vsslicer.gcode.preview.gcode';
const SELECTOR = { language: 'gcode' };
const DEBOUNCE_MS = 300;

/** What the extension tells a test about a document. */
export interface LanguageProbe {
  /** The catalogue flavour in effect (override, else detected), or undefined when unknown. */
  flavour(uri: string): string | undefined;
  /** Why language features are off for a file, if they are. */
  featuresOff(uri: string): Promise<string | undefined>;
  /** Whether the user has been told, by message, that features are off for a file. */
  notified(uri: string): boolean;
}

/** Hover, completion and unknown-command diagnostics for gcode documents, off above 50 MB. */
export const registerLanguageFeatures = (
  context: Pick<vscode.ExtensionContext, 'subscriptions'>,
  host: Api,
  index: CatalogueIndex,
): LanguageProbe => {
  const flavourFor = (doc: vscode.TextDocument): string | undefined => {
    const { detected, override } = flavourOf(host, doc);
    return resolveFlavour(index, override || detected);
  };

  // one size check per document, redone after a save
  const sizes = new Map<string, Promise<number>>();
  const sizeOf = (uri: vscode.Uri): Promise<number> => {
    const key = uri.toString();
    let p = sizes.get(key);
    if (!p) {
      p = Promise.resolve(host.workspace.fs.stat(uri)).then(
        (s) => s.size,
        () => 0, // untitled or unreadable: not known to be large
      );
      sizes.set(key, p);
    }
    return p;
  };
  const off = async (uri: vscode.Uri): Promise<string | undefined> =>
    featuresAvailable(await sizeOf(uri)) ? undefined : OVERSIZE_REASON;

  const notice = host.window.createStatusBarItem(host.StatusBarAlignment.Right, 91);
  notice.text = '$(warning) G-code features off';
  notice.tooltip = `Hover, completion and diagnostics are off because ${OVERSIZE_REASON}. The preview still opens it.`;
  const told = new Set<string>();
  // VS Code does not hand text files over 50 MB to extensions at all, so such a file is only ever seen as an editor tab
  const check = async (uri: vscode.Uri): Promise<void> => {
    const reason = await off(uri);
    const input = host.window.tabGroups.activeTabGroup.activeTab?.input;
    if (input instanceof host.TabInputText && input.uri.toString() === uri.toString()) {
      if (reason) notice.show();
      else notice.hide();
    }
    if (!reason || told.has(uri.toString())) return;
    told.add(uri.toString());
    const open = 'Open in preview';
    const choice = await host.window.showInformationMessage(
      `G-code language features are off for ${uri.path.split('/').pop()}: ${reason}. The preview still opens it.`,
      open,
    );
    if (choice === open)
      await host.commands.executeCommand('vscode.openWith', uri, PREVIEW_VIEW_TYPE).then(undefined, () => undefined);
  };
  const GCODE_FILE = /\.(gcode|g|gco|nc)$/i; // the extensions the language contribution claims
  const checkTabs = (): void =>
    host.window.tabGroups.all
      .flatMap((g) => g.tabs)
      .forEach(
        (t) => t.input instanceof host.TabInputText && GCODE_FILE.test(t.input.uri.path) && void check(t.input.uri),
      );

  const diagnostics = host.languages.createDiagnosticCollection('vsslicer-gcode');
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const scan = async (doc: vscode.TextDocument): Promise<void> => {
    if (doc.languageId !== 'gcode') return;
    if (await off(doc.uri)) return diagnostics.delete(doc.uri);
    const flavour = flavourFor(doc);
    diagnostics.set(
      doc.uri,
      unknownCommands(index, flavour, doc.getText()).map((u) => {
        const d = new host.Diagnostic(
          new host.Range(u.line, u.start, u.line, u.end),
          `${u.code} is not in the ${flavour} command catalogue.`,
          host.DiagnosticSeverity.Warning,
        );
        d.source = 'VSSlicer G-code';
        return d;
      }),
    );
  };
  const schedule = (doc: vscode.TextDocument): void => {
    const key = doc.uri.toString();
    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => void scan(doc), DEBOUNCE_MS),
    );
  };
  const opened = (doc: vscode.TextDocument): void => void scan(doc);

  context.subscriptions.push(
    notice,
    diagnostics,
    { dispose: () => timers.forEach(clearTimeout) },
    host.languages.registerHoverProvider(SELECTOR, {
      provideHover: async (doc, pos) => {
        if (await off(doc.uri)) return undefined;
        const h = hoverAt(index, flavourFor(doc), doc.lineAt(pos.line).text, pos.character);
        return (
          h && new host.Hover(new host.MarkdownString(h.markdown), new host.Range(pos.line, h.start, pos.line, h.end))
        );
      },
    }),
    host.languages.registerCompletionItemProvider(SELECTOR, {
      provideCompletionItems: async (doc, pos) => {
        if (await off(doc.uri)) return undefined;
        return completionsAt(index, flavourFor(doc), doc.lineAt(pos.line).text, pos.character).map((c) => {
          const item = new host.CompletionItem(
            { label: c.label, description: c.detail },
            c.kind === 'command' ? host.CompletionItemKind.Function : host.CompletionItemKind.Property,
          );
          item.documentation = new host.MarkdownString(c.documentation);
          return item;
        });
      },
    }),
    host.workspace.onDidOpenTextDocument(opened),
    host.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
    host.workspace.onDidSaveTextDocument((d) => {
      sizes.delete(d.uri.toString());
      checkTabs();
    }),
    host.workspace.onDidCloseTextDocument((d) => {
      const key = d.uri.toString();
      sizes.delete(key);
      told.delete(key);
      clearTimeout(timers.get(key));
      diagnostics.delete(d.uri);
    }),
    host.window.tabGroups.onDidChangeTabs(checkTabs),
    host.workspace.onDidChangeConfiguration(
      (e) => e.affectsConfiguration('vsslicer.gcode.flavourOverrides') && host.workspace.textDocuments.forEach(opened),
    ),
  );
  host.workspace.textDocuments.forEach(opened);
  checkTabs();

  return {
    flavour: (uri) => {
      const doc = host.workspace.textDocuments.find((d) => d.uri.toString() === uri);
      return doc && flavourFor(doc);
    },
    featuresOff: (uri) => off(host.Uri.parse(uri)),
    notified: (uri) => told.has(uri),
  };
};
