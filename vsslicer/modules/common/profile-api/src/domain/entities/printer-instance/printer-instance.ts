// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Nozzle, PrinterInstance } from '../entities.ts';

/** The D3 connector values. A static list in M2; E20 registers adapters for them later. */
export const HOST_TYPES = ['bambu-lan', 'moonraker', 'octoprint', 'prusalink', 'duet'] as const;
export type HostType = (typeof HOST_TYPES)[number];

/** Rule 25: the longest host or URL string accepted. */
export const MAX_CONNECTION_STRING = 2048;

const CREDENTIAL_KEYS = ['password', 'apikey', 'access_code', 'token'];

export interface ConnectionIssue {
  /** Dotted path, e.g. `connection.host_type`. */
  path: string;
  message: string;
}

/** Validates the `connection` of an untrusted printer instance. A linear check: no regex runs over the strings. */
export function validateConnection(connection: unknown): ConnectionIssue[] {
  if (typeof connection !== 'object' || connection === null || Array.isArray(connection))
    return [{ path: 'connection', message: 'connection is not an object' }];
  const issues: ConnectionIssue[] = [];
  const c = connection as Record<string, unknown>;
  for (const key of Object.keys(c)) {
    if (key === 'host_type' || key === 'url' || key === 'secret_ref') continue;
    const credential = CREDENTIAL_KEYS.includes(key.toLowerCase());
    issues.push({
      path: `connection.${key}`,
      message: credential ? 'a credential belongs in SecretStorage, not the profile' : 'unknown property',
    });
  }
  for (const key of ['host_type', 'url', 'secret_ref']) {
    const v = c[key];
    if (typeof v !== 'string') issues.push({ path: `connection.${key}`, message: `${key} is not a string` });
    else if (v.length > MAX_CONNECTION_STRING)
      issues.push({ path: `connection.${key}`, message: `${key} is over ${MAX_CONNECTION_STRING} characters` });
  }
  if (
    typeof c.host_type === 'string' &&
    c.host_type.length <= MAX_CONNECTION_STRING &&
    !(HOST_TYPES as readonly string[]).includes(c.host_type)
  )
    issues.push({
      path: 'connection.host_type',
      message: `unknown host_type; expected one of ${HOST_TYPES.join(', ')}`,
    });
  return issues;
}

export interface ResolvedToolhead {
  slot: number;
  nozzle: Nozzle;
}

/** The nozzle entity of each toolhead slot, in slot order; throws on a duplicate slot or an unknown nozzle id. */
export function resolveToolheads(instance: PrinterInstance, nozzles: ReadonlyMap<string, Nozzle>): ResolvedToolhead[] {
  const seen = new Set<number>();
  return instance.toolheads
    .map(({ slot, nozzle }) => {
      if (seen.has(slot)) throw new Error(`Instance "${instance.id}" names toolhead slot ${slot} twice`);
      seen.add(slot);
      const found = nozzles.get(nozzle);
      if (!found) throw new Error(`Instance "${instance.id}" slot ${slot} names unknown nozzle "${nozzle}"`);
      return { slot, nozzle: found };
    })
    .sort((a, b) => a.slot - b.slot);
}
