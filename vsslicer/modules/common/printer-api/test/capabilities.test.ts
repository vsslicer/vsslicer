// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, test } from 'vitest';
import {
  CAPABILITY_FLAGS,
  MUTATING_FLAGS,
  can,
  isReadOnly,
  readOnlyReason,
  type CapabilityAnnotation,
  type CapabilityFlag,
  type PrinterMode,
} from '../src/domain/index.ts';

const dev: CapabilityAnnotation = { requiresMode: 'developerMode' };
const bambu = (modes: PrinterMode[]) => ({
  flags: new Map<CapabilityFlag, CapabilityAnnotation>([
    ['telemetryPush', { readOnly: true }],
    ['webcamStream', { readOnly: true }],
    ['listFiles', { readOnly: true }],
    ['upload', dev],
    ['start', dev],
    ['cancel', dev],
  ]),
  activeModes: new Set(modes),
});

describe('capabilities', () => {
  test('lists the 27 flags with no duplicates, including downloadFile and moveFile', () => {
    expect(CAPABILITY_FLAGS).toHaveLength(27);
    expect(new Set(CAPABILITY_FLAGS).size).toBe(27);
    expect(CAPABILITY_FLAGS).toContain('downloadFile');
    expect(CAPABILITY_FLAGS).toContain('moveFile');
  });

  test('Bambu-shaped set with Developer Mode off is read-only with a reason', () => {
    const caps = bambu([]);
    expect(can(caps, 'telemetryPush')).toBe(true);
    expect(can(caps, 'upload')).toBe(false);
    expect(can(caps, 'pause')).toBe(false); // undeclared
    expect(isReadOnly(caps)).toBe(true);
    expect(readOnlyReason(caps)).toBe('requires Developer Mode');
  });

  test('un-annotated non-mutating flags do not break read-only (reviewer probe)', () => {
    const caps = bambu([]);
    caps.flags.set('discovery', {});
    caps.flags.set('remoteWorkspaceSafe', {});
    expect(isReadOnly(caps)).toBe(true);
    expect(readOnlyReason(caps)).toBe('requires Developer Mode');
    expect(MUTATING_FLAGS.has('emergencyStop')).toBe(true);
  });

  test('Developer Mode on unlocks the gated flags', () => {
    const caps = bambu(['developerMode']);
    expect(can(caps, 'upload')).toBe(true);
    expect(isReadOnly(caps)).toBe(false);
    expect(readOnlyReason(caps)).toBeUndefined();
  });
});
