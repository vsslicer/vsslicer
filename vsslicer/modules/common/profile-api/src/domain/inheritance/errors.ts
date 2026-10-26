// SPDX-License-Identifier: AGPL-3.0-or-later
export class InheritanceCycleError extends Error {
  /** The loop in inheritance order, first id repeated at the end (`a`, `b`, `a`). */
  readonly cycle: readonly string[];
  constructor(cycle: readonly string[]) {
    super(`Inheritance cycle: ${cycle.join(' -> ')}`);
    this.name = 'InheritanceCycleError';
    this.cycle = cycle;
  }
}

export class UnknownParentError extends Error {
  readonly child: string;
  readonly parent: string;
  constructor(child: string, parent: string) {
    super(`Entity "${child}" inherits from unknown parent "${parent}"`);
    this.name = 'UnknownParentError';
    this.child = child;
    this.parent = parent;
  }
}
