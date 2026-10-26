// SPDX-License-Identifier: AGPL-3.0-or-later
// Follow mode of one preview: the view tracks the fed move until the user breaks out, and rejoins at the latest one.

export interface FollowState {
  following: boolean;
  /** The newest fed move, kept while broken out so a rejoin can jump to it. */
  target?: number;
}

export type FollowEvent = { kind: 'feed'; move: number } | { kind: 'breakOut' } | { kind: 'rejoin' };

/** The next state and the move to show now, if any. */
export const nextFollow = (s: FollowState, e: FollowEvent): { state: FollowState; seek?: number } => {
  switch (e.kind) {
    case 'feed':
      return { state: { ...s, target: e.move }, seek: s.following ? e.move : undefined };
    case 'breakOut':
      return { state: { ...s, following: false } };
    case 'rejoin':
      return { state: { ...s, following: true }, seek: s.target };
  }
};
