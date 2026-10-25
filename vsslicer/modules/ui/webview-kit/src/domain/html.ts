// SPDX-License-Identifier: AGPL-3.0-or-later
/** Structural slice of `vscode.Webview`, so a real webview or a plain object both fit. */
export interface CspWebview {
  readonly cspSource: string;
}
/** A string or anything with `toString()`, such as the `vscode.Uri` from `webview.asWebviewUri`. */
export type UriLike = string | { toString(): string };

export interface WebviewHtmlOptions {
  readonly webview: CspWebview;
  /** Script URIs, already converted with `webview.asWebviewUri`; each tag gets the nonce. */
  readonly scripts: readonly UriLike[];
  readonly styles?: readonly UriLike[];
  /** Trusted markup for `<body>`, e.g. the root element. */
  readonly body?: string;
  readonly title?: string;
}

const escape = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!); // attributes are double-quoted

/** 128 random bits, base64, from Web Crypto (present in Node 24 and in webviews). */
function createNonce(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
}

/** The policy, one directive per line of the README's table. Throws if `cspSource` could inject a directive. */
export function contentSecurityPolicy(cspSource: string, nonce: string): string {
  if (/[;,\r\n]/.test(cspSource)) throw new Error(`cspSource must be a source list, got ${JSON.stringify(cspSource)}`);
  return [
    `default-src 'none'`,
    `script-src 'nonce-${nonce}'`,
    `style-src ${cspSource}`,
    `img-src ${cspSource} data: blob:`,
    `font-src ${cspSource}`,
    `connect-src ${cspSource}`,
    // unverified: blob: workers under this policy are the PLT worker spike's question (3d-viewer.md open question 2).
    `worker-src ${cspSource} blob:`,
  ].join('; ');
}

/** A complete webview document with a fresh nonce and the kit's CSP. */
export function createWebviewHtml({
  webview,
  scripts,
  styles = [],
  body = '',
  title = '',
}: WebviewHtmlOptions): string {
  const nonce = createNonce();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${escape(contentSecurityPolicy(webview.cspSource, nonce))}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
${styles.map((s) => `<link rel="stylesheet" href="${escape(String(s))}">`).join('\n')}
</head>
<body>
${body}
${scripts.map((s) => `<script nonce="${nonce}" src="${escape(String(s))}" defer></script>`).join('\n')}
</body>
</html>
`;
}

/**
 * `localResourceRoots` for webview options: exactly `folders` under `base`, never VS Code's default
 * (every workspace folder plus the extension). Pass `vscode.Uri.joinPath` as `join`.
 */
export function localResourceRoots<U>(
  base: U,
  folders: readonly string[],
  join: (base: U, ...segments: string[]) => U,
): U[] {
  return folders.map((folder) => {
    const segments = folder.split(/[/\\]/);
    if (
      !folder ||
      /^[/\\]|^[A-Za-z]:/.test(folder) ||
      segments.some((s) => s === '..') ||
      segments.every((s) => s === '.' || s === '')
    )
      throw new Error(`localResourceRoots: folder must be relative and inside the base, got ${JSON.stringify(folder)}`);
    return join(base, ...segments);
  });
}
