// SPDX-License-Identifier: AGPL-3.0-or-later

export const AUTH_SCHEME_IDS = ['apikey', 'digest', 'session', 'bearer', 'token', 'pairing', 'accessCode'] as const;

export type AuthSchemeId = (typeof AUTH_SCHEME_IDS)[number];

/** One input a connection form shows for a scheme. Secrets go to SecretStorage, masked. */
export interface AuthField {
  readonly name: string;
  readonly label: string;
  readonly secret: boolean;
}

export interface AuthScheme {
  readonly id: AuthSchemeId;
  readonly fields: readonly AuthField[];
}

const field = (name: string, label: string, secret: boolean): AuthField => ({ name, label, secret });

/** What each scheme asks the user for. An adapter declares the ids it supports. */
export const AUTH_SCHEMES: Readonly<Record<AuthSchemeId, AuthScheme>> = {
  apikey: { id: 'apikey', fields: [field('apiKey', 'API key', true)] },
  digest: {
    id: 'digest',
    fields: [field('username', 'Username', false), field('password', 'Password', true)],
  },
  session: {
    id: 'session',
    fields: [field('username', 'Username', false), field('password', 'Password', true)],
  },
  bearer: { id: 'bearer', fields: [field('token', 'Bearer token', true)] },
  token: { id: 'token', fields: [field('token', 'Access token', true)] },
  // The printer asks the user to approve on its own screen: nothing to type.
  pairing: { id: 'pairing', fields: [] },
  accessCode: { id: 'accessCode', fields: [field('accessCode', 'Access code', true)] },
};
