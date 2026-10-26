// SPDX-License-Identifier: AGPL-3.0-or-later
// Kills its own thread without a message, like a native crash would.
export default { formats: [], canHandle: () => true, import: () => process.exit(3) };
