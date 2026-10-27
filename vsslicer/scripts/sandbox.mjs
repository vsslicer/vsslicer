#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Usage: node scripts/sandbox.mjs [--reset]
// Opens the built VSSlicer apps in an isolated VS Code: its own profile and extensions folder under .sandbox/,
// stock developer tooling (git, GitHub, Copilot, debuggers, task runners, notebooks) disabled, sample G-code to open.
// Build first: node scripts/run.mjs build (or pnpm build in each app).
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const box = join(root, '.sandbox');
if (process.argv.includes('--reset')) rmSync(box, { recursive: true, force: true });

// apps with working features; the others are scaffolds with one "about" command
const apps = ['apps/gcode-preview', 'apps/gcode-language', 'apps/printers', 'apps/profiles', 'apps/project', 'apps/slicer'];
for (const a of apps) {
  const pkg = JSON.parse(readFileSync(join(root, 'modules', a, 'package.json'), 'utf8'));
  if (pkg.main && !existsSync(join(root, 'modules', a, pkg.main))) (console.error(`sandbox: ${a} is not built (${pkg.main} missing); run node scripts/run.mjs build`), process.exit(1));
}

const disabled = [
  'vscode.git', 'vscode.git-base', 'vscode.github', 'vscode.github-authentication', 'vscode.microsoft-authentication',
  'vscode.merge-conflict', 'vscode.tunnel-forwarding', 'vscode.docker',
  'vscode.npm', 'vscode.grunt', 'vscode.gulp', 'vscode.jake',
  'vscode.debug-auto-launch', 'vscode.debug-server-ready', 'ms-vscode.js-debug', 'ms-vscode.js-debug-companion', 'ms-vscode.vscode-js-profile-table',
  'GitHub.copilot-chat', 'TypeScriptTeam.jsts-chat-features', 'vscode.prompt',
  'vscode.ipynb', 'vscode.builtin-notebook-renderers', 'vscode.simple-browser', 'vscode.emmet',
];

const settings = {
  'git.enabled': false,
  'scm.alwaysShowProviders': false,
  'chat.disableAIFeatures': true,
  'workbench.remoteIndicator.showExtensionRecommendations': false,
  'extensions.autoCheckUpdates': false,
  'extensions.autoUpdate': false,
  'extensions.ignoreRecommendations': true,
  'update.mode': 'none',
  'telemetry.telemetryLevel': 'off',
  'workbench.startupEditor': 'none',
  'workbench.tips.enabled': false,
  'security.workspace.trust.enabled': false,
};
mkdirSync(join(box, 'user', 'User'), { recursive: true });
writeFileSync(join(box, 'user', 'User', 'settings.json'), JSON.stringify(settings, null, 2));

// copies, so the sandbox never edits a fixture
const ws = join(box, 'workspace');
const samples = {
  'cura-cube-cylinder.gcode': 'core/gcode-parser/test/fixtures/cura/cube-cylinder-4.10.0.gcode',
  'orca-two-material-x1c.gcode': 'core/gcode-parser/test/fixtures/orca/two-material-x1c.gcode',
  'orca-cylinder-arcs-x1c.gcode': 'core/gcode-parser/test/fixtures/orca/cylinder-arcs-on-x1c.gcode',
  'prusa-mini-cube.gcode': 'core/gcode-parser/test/fixtures/prusaslicer/mini_cube_b.twin.gcode',
  'prusa-arcs.gcode': 'core/gcode-parser/test/fixtures/prusaslicer/test_arcs_ps2.9.0-alpha1.gcode',
};
mkdirSync(ws, { recursive: true });
for (const [name, src] of Object.entries(samples)) if (existsSync(join(root, 'modules', src)) && !existsSync(join(ws, name))) cpSync(join(root, 'modules', src), join(ws, name));

const code = process.env.VSCODE_BIN ?? 'code';
const args = [
  '--user-data-dir', join(box, 'user'),
  '--extensions-dir', join(box, 'extensions'),
  ...apps.map((a) => `--extensionDevelopmentPath=${join(root, 'modules', a)}`),
  ...disabled.flatMap((id) => ['--disable-extension', id]),
  '--new-window', ws,
];
spawn(code, args, { stdio: 'inherit', detached: true, shell: process.platform === 'win32' }).unref();
console.log(`sandbox: VS Code started with ${apps.length} apps; profile in ${box}`);
