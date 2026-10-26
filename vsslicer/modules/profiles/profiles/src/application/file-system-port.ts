// SPDX-License-Identifier: AGPL-3.0-or-later
/** The one file-system operation the locator needs: list a directory's entry names. Rejects when it cannot. */
export interface DirectoryLister {
  listDirectory(path: string): Promise<string[]>;
}
