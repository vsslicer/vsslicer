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

test('a new required member of a caller-built interface fails; an optional one passes', () => {
  const opts = (body: string) =>
    report(1) + `export interface OpenOptions {\n    keep: number;\n    plate?: number;\n${body}}\n`;
  assert.equal(apiProblems(opts(''), opts('    speed: number;\n')).length, 1);
  assert.equal(apiProblems(opts(''), opts('    readonly speed: number;\n')).length, 1);
  assert.deepEqual(
    apiProblems(opts(''), opts('    speed?: number;\n    readonly gap?: number;\n    // (undocumented)\n')),
    [],
  );
  // The same line in another interface of the old report does not make it "already there".
  const twin = (body: string) =>
    report(1, 'speed: number;') + `export interface PrintPosition {\n    line: number;\n${body}}\n` + opts('');
  assert.equal(apiProblems(twin(''), twin('    speed: number;\n')).length, 1); // in GcodePreviewApi
  assert.equal(apiProblems(twin(''), twin('    keep: number;\n')).length, 1); // in OpenOptions
  // A required member added to an interface the extension builds itself stays additive.
  assert.deepEqual(apiProblems(report(1), report(1, 'follow(uri: UriArg): void;\n    readonly name: string;')), []);
});

test('a breaking change passes once the contract version is raised', () => {
  assert.deepEqual(apiProblems(report(1), report(2, 'follow(uri: string): void;')), []);
});
