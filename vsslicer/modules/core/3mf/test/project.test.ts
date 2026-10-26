// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from 'vitest';
import { createMesh, createProject, IDENTITY } from '../src/index.ts';

const mesh = createMesh(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), new Uint32Array([0, 1, 2]));
const object = {
  id: 1,
  name: 'cube',
  config: new Map(),
  parts: [{ id: 1, name: 'p', mesh, transform: IDENTITY, config: new Map() }],
};

describe('createMesh', () => {
  it('keeps typed arrays', () => {
    expect(mesh.vertices).toBeInstanceOf(Float32Array);
    expect(mesh.triangles).toBeInstanceOf(Uint32Array);
  });
  it('rejects non-triplets and bad indices', () => {
    expect(() => createMesh(new Float32Array(2), new Uint32Array(0))).toThrow(RangeError);
    expect(() => createMesh(new Float32Array(9), new Uint32Array(2))).toThrow(RangeError);
    expect(() => createMesh(new Float32Array(9), new Uint32Array([0, 1, 3]))).toThrow(RangeError);
  });
});

describe('createProject', () => {
  it('defaults the collections', () => {
    const p = createProject({ dialect: 'core' });
    expect([p.plates, p.objects, p.instances, p.preserved]).toEqual([[], [], [], []]);
    expect(p.rawConfig.size).toBe(0);
  });
  it('accepts instances of known objects', () => {
    const p = createProject({
      dialect: 'bambu',
      objects: [object],
      instances: [{ objectId: 1, transform: IDENTITY, plateId: 1 }],
    });
    expect(p.instances).toHaveLength(1);
  });
  it('rejects duplicate objects and dangling instances', () => {
    expect(() => createProject({ dialect: 'core', objects: [object, object] })).toThrow(RangeError);
    expect(() => createProject({ dialect: 'core', instances: [{ objectId: 9, transform: IDENTITY }] })).toThrow(
      RangeError,
    );
  });
});
