// SPDX-License-Identifier: AGPL-3.0-or-later

export const ENGINE_SOURCES = ['user-setting', 'detected', 'downloaded'] as const;
/** Where an install came from: a path the user set, found on this machine, or fetched from the pinned manifest. */
export type EngineSource = (typeof ENGINE_SOURCES)[number];

export interface EngineInstall {
  readonly id: string;
  readonly version: string;
  /** Absolute path of the engine executable. */
  readonly path: string;
  readonly source: EngineSource;
}

/** Finds engines already on this machine (user setting first, then detection). */
export interface EngineLocator {
  locate(engineId: string, signal?: AbortSignal): Promise<readonly EngineInstall[]>;
}

/** Downloads and verifies the engine a manifest pins for this platform. */
export interface EngineProvisioner {
  provision(manifest: EngineManifest, platform: string, signal?: AbortSignal): Promise<EngineInstall>;
}

/** One downloadable build. The SHA-256 is mandatory: a download is never trusted without it. */
export interface EngineRelease {
  readonly url: string;
  readonly size: number;
  readonly sha256: string;
}

export interface EngineManifest {
  readonly schemaVersion: 1;
  readonly engine: string;
  readonly version: string;
  /** Keyed by platform, e.g. `darwin-arm64`, `linux-x64`, `win32-x64`. */
  readonly releases: Readonly<Record<string, EngineRelease>>;
}

/** Bounds applied to untrusted manifest input. */
export const MANIFEST_LIMITS = {
  /** Counts UTF-16 code units (`string.length`), not UTF-8 bytes; worst case is about 3x in bytes. */
  maxChars: 64 * 1024,
  maxPlatforms: 16,
  maxString: 512,
  maxReleaseBytes: 4 * 1024 ** 3,
} as const;

/** JSON Schema for the pinned-release manifest, for editors and the published docs. */
export const ENGINE_MANIFEST_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  required: ['schemaVersion', 'engine', 'version', 'releases'],
  additionalProperties: false,
  properties: {
    schemaVersion: { const: 1 },
    engine: { type: 'string', minLength: 1, maxLength: MANIFEST_LIMITS.maxString },
    version: { type: 'string', minLength: 1, maxLength: MANIFEST_LIMITS.maxString },
    releases: {
      type: 'object',
      minProperties: 1,
      maxProperties: MANIFEST_LIMITS.maxPlatforms,
      additionalProperties: {
        type: 'object',
        required: ['url', 'size', 'sha256'],
        additionalProperties: false,
        properties: {
          url: { type: 'string', pattern: '^https://', maxLength: MANIFEST_LIMITS.maxString },
          size: { type: 'integer', minimum: 1, maximum: MANIFEST_LIMITS.maxReleaseBytes },
          sha256: { type: 'string', pattern: '^[0-9a-f]{64}$' },
        },
      },
    },
  },
} as const;

export type ManifestResult = { ok: true; manifest: EngineManifest } | { ok: false; errors: string[] };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= MANIFEST_LIMITS.maxString;
const HEX64 = /^[0-9a-f]{64}$/; // fixed length, no backtracking
const TOP_KEYS = ['schemaVersion', 'engine', 'version', 'releases'];
const RELEASE_KEYS = ['url', 'size', 'sha256'];

function isHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return (
      s.startsWith('https://') && u.protocol === 'https:' && u.hostname !== '' && u.username === '' && u.password === ''
    );
  } catch {
    return false;
  }
}

function checkRelease(platform: string, r: unknown, errors: string[]): void {
  if (!isObj(r)) return void errors.push(`releases.${platform}: not an object`);
  for (const k of Object.keys(r))
    if (!RELEASE_KEYS.includes(k)) errors.push(`releases.${platform}.${k}: unknown property`);
  if (!isStr(r.url) || !isHttpsUrl(r.url)) errors.push(`releases.${platform}.url: https URL required`);
  if (!Number.isInteger(r.size) || (r.size as number) < 1 || (r.size as number) > MANIFEST_LIMITS.maxReleaseBytes)
    errors.push(`releases.${platform}.size: integer in 1..${MANIFEST_LIMITS.maxReleaseBytes}`);
  if (typeof r.sha256 !== 'string' || !HEX64.test(r.sha256))
    errors.push(`releases.${platform}.sha256: 64 lowercase hex characters required`);
}

/** Validates an already-parsed manifest. Never throws. */
export function validateEngineManifest(value: unknown): ManifestResult {
  const errors: string[] = [];
  if (!isObj(value)) return { ok: false, errors: ['manifest: not an object'] };
  for (const k of Object.keys(value)) if (!TOP_KEYS.includes(k)) errors.push(`${k.slice(0, 64)}: unknown property`);
  if (value.schemaVersion !== 1) errors.push('schemaVersion: must be 1');
  if (!isStr(value.engine)) errors.push('engine: non-empty string required');
  if (!isStr(value.version)) errors.push('version: non-empty string required');
  if (!isObj(value.releases)) errors.push('releases: object required');
  else {
    const platforms = Object.keys(value.releases);
    if (platforms.length === 0 || platforms.length > MANIFEST_LIMITS.maxPlatforms)
      errors.push(`releases: 1..${MANIFEST_LIMITS.maxPlatforms} platforms required`);
    else for (const p of platforms) checkRelease(p.slice(0, 64), value.releases[p], errors);
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true, manifest: value as unknown as EngineManifest };
}

/** Parses manifest text, rejecting oversize input before JSON.parse. Never throws. */
export function parseEngineManifest(text: string): ManifestResult {
  if (text.length > MANIFEST_LIMITS.maxChars) return { ok: false, errors: ['manifest: too large'] };
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, errors: ['manifest: not valid JSON'] };
  }
  return validateEngineManifest(value);
}
