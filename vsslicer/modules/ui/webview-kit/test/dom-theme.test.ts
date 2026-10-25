// SPDX-License-Identifier: AGPL-3.0-or-later
// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import { domThemeHost, watchTheme } from '../src/webview/index.ts';

const tick = () => new Promise((r) => setTimeout(r, 0));

test('domThemeHost reports --vscode-* tokens and fires once per style or class change', async () => {
  const root = document.documentElement;
  root.style.setProperty('--vscode-foreground', '#111');
  const host = domThemeHost(document, MutationObserver);
  expect(host.tokens()).toEqual({ '--vscode-foreground': '#111' });

  const onChange = vi.fn();
  const stop = host.observe(onChange);
  root.style.setProperty('--vscode-foreground', '#eee');
  await tick();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(host.tokens()['--vscode-foreground']).toBe('#eee');

  root.classList.add('vscode-dark');
  await tick();
  expect(onChange).toHaveBeenCalledTimes(2);

  stop();
  root.style.setProperty('--vscode-foreground', '#000');
  await tick();
  expect(onChange).toHaveBeenCalledTimes(2);
});

test('watchTheme delivers new tokens after a style change', async () => {
  const root = document.documentElement;
  const got: Record<string, string>[] = [];
  const stop = watchTheme(domThemeHost(), (t) => got.push({ ...t }));
  root.style.setProperty('--vscode-editor-background', '#222');
  await tick();
  stop();
  expect(got.at(-1)?.['--vscode-editor-background']).toBe('#222');
});
