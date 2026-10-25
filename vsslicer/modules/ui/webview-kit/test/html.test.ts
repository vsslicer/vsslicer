// SPDX-License-Identifier: AGPL-3.0-or-later
import { posix } from 'node:path';
import { describe, expect, test } from 'vitest';
import { contentSecurityPolicy, createWebviewHtml, localResourceRoots } from '../src/domain/html.ts';

const webview = { cspSource: 'https://*.vscode-cdn.net' };
const nonceOf = (html: string) => /'nonce-([^']+)'/.exec(html)?.[1];

describe('createWebviewHtml', () => {
  const html = createWebviewHtml({
    webview,
    scripts: ['https://x.vscode-cdn.net/ext/dist/main.js'],
    styles: [{ toString: () => 'https://x.vscode-cdn.net/ext/dist/main.css' }],
    body: '<div id="root"></div>',
  });

  test('policy has no unsafe-inline or unsafe-eval and starts from default-src none', () => {
    expect(html).not.toMatch(/unsafe-/);
    expect(html).toContain(`default-src 'none'`);
  });

  test('every script tag carries the policy nonce; styles and body are present', () => {
    const nonce = nonceOf(html);
    expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(html).toContain(`<script nonce="${nonce}" src="https://x.vscode-cdn.net/ext/dist/main.js" defer></script>`);
    expect(html).toContain(`<link rel="stylesheet" href="https://x.vscode-cdn.net/ext/dist/main.css">`);
    expect(html).toContain('<div id="root"></div>');
  });

  test('each call gets a fresh nonce', () => {
    const nonces = new Set(Array.from({ length: 50 }, () => nonceOf(createWebviewHtml({ webview, scripts: [] }))));
    expect(nonces.size).toBe(50);
  });

  test('escapes URIs so they cannot break out of the attribute', () => {
    const out = createWebviewHtml({ webview, scripts: ['a"><script>alert(1)</script>'] });
    expect(out).not.toContain('"><script>alert');
    expect(out).toContain('a&quot;&gt;&lt;script&gt;');
  });
});

describe('contentSecurityPolicy', () => {
  test('lists exactly the documented directives', () => {
    expect(contentSecurityPolicy('vscode-src', 'N')).toBe(
      [
        `default-src 'none'`,
        `script-src 'nonce-N'`,
        `style-src vscode-src`,
        `img-src vscode-src data: blob:`,
        `font-src vscode-src`,
        `connect-src vscode-src`,
        `worker-src vscode-src blob:`,
      ].join('; '),
    );
  });

  test.each(['a; script-src *', 'a, b', 'a\nb'])('refuses a cspSource that could inject directives: %j', (src) => {
    expect(() => contentSecurityPolicy(src, 'N')).toThrow(/cspSource/);
  });
});

describe('localResourceRoots', () => {
  const join = (base: string, ...s: string[]) => posix.join(base, ...s);

  test('returns only the named folders under the base', () => {
    expect(localResourceRoots('/ext', ['dist/webview', 'media'], join)).toEqual(['/ext/dist/webview', '/ext/media']);
  });

  test('an empty list means no local resources, never the VS Code defaults', () => {
    expect(localResourceRoots('/ext', [], join)).toEqual([]);
  });

  test.each(['', '.', '/etc', '../other', 'dist/../..', 'a\\..\\b', 'C:/x'])('refuses folder %j', (folder) => {
    expect(() => localResourceRoots('/ext', [folder], join)).toThrow(/folder/);
  });
});
