// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiProblems } from '../etc/check-api.ts';

const report = (version: number, body = 'follow(uri: UriArg): void;') =>
  `export const GCODE_PREVIEW_API_VERSION = ${version};\nexport interface GcodePreviewApi {\n    ${body}\n}\n`;

test('an additive change passes without a version bump', () => {
  assert.deepEqual(apiProblems(report(1), report(1) + '    stopFollow(uri: UriArg): void;\n'), []);
});

test('a removed or changed line fails without a version bump', () => {
  assert.equal(apiProblems(report(1), report(1, 'follow(uri: string): void;')).length, 1);
  assert.equal(apiProblems(report(1), report(1, '')).length, 1);
});

test('a breaking change passes once the contract version is raised', () => {
  assert.deepEqual(apiProblems(report(1), report(2, 'follow(uri: string): void;')), []);
});
