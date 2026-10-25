// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser-side entry of the sample webview (esbuild, platform browser, iife). Harnesses load this bundle.
declare const acquireVsCodeApi: () => { postMessage(message: unknown): void };

const heading = document.createElement('h1');
heading.id = 'title';
heading.textContent = 'VSSlicer sample webview';
document.body.append(heading);
acquireVsCodeApi().postMessage({ type: 'ready' });
