// SPDX-License-Identifier: AGPL-3.0-or-later
export type ThreeMfErrorCode =
  | 'corrupt-zip'
  | 'missing-root-model'
  | 'malformed-xml'
  | 'unsupported-required-extension'
  | 'size-cap-exceeded'
  | 'missing-production-part';

/** Base of every 3MF failure: a stable `code` for callers, a `userMessage` safe to show as is. */
export abstract class ThreeMfError extends Error {
  abstract readonly code: ThreeMfErrorCode;
  readonly userMessage: string;

  constructor(userMessage: string, options?: ErrorOptions) {
    super(userMessage, options);
    this.name = new.target.name;
    this.userMessage = userMessage;
  }
}

export class CorruptZipError extends ThreeMfError {
  readonly code = 'corrupt-zip';
  constructor(options?: ErrorOptions) {
    super('This file is not a valid 3MF: its zip archive is damaged or incomplete.', options);
  }
}

export class MissingRootModelError extends ThreeMfError {
  readonly code = 'missing-root-model';
  constructor(options?: ErrorOptions) {
    super('This 3MF has no root 3D model part, so there is nothing to show.', options);
  }
}

export class MalformedXmlError extends ThreeMfError {
  readonly code = 'malformed-xml';
  readonly part: string;
  constructor(part: string, detail: string, options?: ErrorOptions) {
    super(`The XML in "${part}" is malformed: ${detail}`, options);
    this.part = part;
  }
}

export class UnsupportedRequiredExtensionError extends ThreeMfError {
  readonly code = 'unsupported-required-extension';
  readonly extension: string;
  constructor(extension: string, options?: ErrorOptions) {
    super(`This 3MF requires the extension "${extension}", which VSSlicer does not support.`, options);
    this.extension = extension;
  }
}

export class SizeCapExceededError extends ThreeMfError {
  readonly code = 'size-cap-exceeded';
  readonly limitBytes: number;
  constructor(what: string, limitBytes: number, options?: ErrorOptions) {
    super(`${what} is larger than the ${limitBytes} byte limit, so it was not opened.`, options);
    this.limitBytes = limitBytes;
  }
}

export class MissingProductionPartError extends ThreeMfError {
  readonly code = 'missing-production-part';
  readonly path: string;
  constructor(path: string, options?: ErrorOptions) {
    super(`The model refers to the part "${path}" (Production extension), but the file does not contain it.`, options);
    this.path = path;
  }
}
