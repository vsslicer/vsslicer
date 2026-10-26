// SPDX-License-Identifier: AGPL-3.0-or-later
// Presentation layer entry: the only file that imports the VS Code API at runtime.
import { join } from 'node:path';
import type * as vscode from 'vscode';
import * as api from 'vscode';
import { loadCatalogue } from '../adapters/catalogue.ts';
import { buildIndex } from '../domain/lookup.ts';
import { registerLanguageFeatures, type LanguageProbe } from './features.ts';
import { registerFlavourStatus } from './status.ts';

export const activate = (context: vscode.ExtensionContext): LanguageProbe => {
  registerFlavourStatus(context, api);
  return registerLanguageFeatures(context, api, buildIndex(loadCatalogue(join(context.extensionPath, 'catalogue'))));
};
