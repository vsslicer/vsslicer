// SPDX-License-Identifier: AGPL-3.0-or-later
/** Typed engine failures. Plain data (JSON-safe), never an Error instance, so no stack trace travels with it. */
export type EngineError =
  | { code: 'not-installed'; engine: string }
  | { code: 'unsupported-version'; engine: string; found: string; required: string }
  | { code: 'unknown-exit-code'; engine: string; exitCode: number }
  | { code: 'exit-code'; engine: string; exitCode: number; name: string }
  | { code: 'crash'; engine: string; signal: string }
  | { code: 'timeout'; engine: string; seconds: number }
  | { code: 'cancelled'; engine: string }
  | { code: 'empty-output'; engine: string }
  | { code: 'missing-plate-output'; engine: string; plate: number }
  | { code: 'bad-input'; engine: string; reason: string }
  | { code: 'checksum-mismatch'; engine: string; expected: string; actual: string }
  | { code: 'offline'; engine: string }
  | { code: 'http'; engine: string; status: number };

export type EngineErrorCode = EngineError['code'];

export interface EngineErrorText {
  readonly code: EngineErrorCode;
  readonly message: string;
  readonly remediation: string;
}

/** User-facing text. Built only from the variant's fields, so it cannot leak a stack. */
export const describeEngineError = (e: EngineError): EngineErrorText => {
  const t = (message: string, remediation: string): EngineErrorText => ({ code: e.code, message, remediation });
  switch (e.code) {
    case 'not-installed':
      return t(`${e.engine} is not installed.`, `Install ${e.engine} or set its path in the VSSlicer settings.`);
    case 'unsupported-version':
      return t(
        `${e.engine} ${e.found} is not supported (need ${e.required}).`,
        `Install ${e.engine} ${e.required} and point VSSlicer at it.`,
      );
    case 'unknown-exit-code':
      return t(
        `${e.engine} stopped with the unrecognised exit code ${e.exitCode}.`,
        `Check the ${e.engine} log; report the code if it persists.`,
      );
    case 'exit-code':
      return t(
        `${e.engine} failed: ${e.name} (exit code ${e.exitCode}).`,
        `Fix the cause named above and slice again; see the ${e.engine} log for details.`,
      );
    case 'crash':
      return t(
        `${e.engine} crashed (signal ${e.signal}).`,
        `Try again; if it repeats, update ${e.engine} or simplify the model.`,
      );
    case 'timeout':
      return t(
        `${e.engine} did not finish within ${e.seconds} seconds.`,
        'Raise vsslicer.slicer.timeout or slice a simpler model.',
      );
    case 'cancelled':
      return t(`Slicing with ${e.engine} was cancelled.`, 'Start the slice again when ready.');
    case 'empty-output':
      return t(
        `${e.engine} produced no G-code.`,
        'Check the model sits inside the build volume and the profile is valid.',
      );
    case 'missing-plate-output':
      return t(
        `${e.engine} produced no output for plate ${e.plate}.`,
        'Check that plate holds a printable object, then slice again.',
      );
    case 'bad-input':
      return t(`The slice input was rejected: ${e.reason}.`, 'Correct the project or profile and try again.');
    case 'checksum-mismatch':
      return t(
        `The ${e.engine} download is corrupt (checksum mismatch).`,
        'Retry the download; if it repeats, install the engine manually.',
      );
    case 'offline':
      return t(
        `Cannot download ${e.engine}: no network connection.`,
        'Connect to the internet and retry, or install the engine manually.',
      );
    case 'http':
      return t(
        `The ${e.engine} download failed with HTTP ${e.status}.`,
        'Retry later, or install the engine manually.',
      );
  }
};

/**
 * Maps a raw process exit code to an error, or undefined for success (only a raw 0).
 * `named` is keyed by signed codes (Orca's -100); POSIX reports those modulo 256 (156), so 128..255 is
 * read as a signed byte. Anything unnamed stays `unknown-exit-code` with the raw value.
 */
export const classifyExitCode = (
  engine: string,
  rawCode: number,
  named: Readonly<Record<number, string>>,
): EngineError | undefined => {
  if (rawCode === 0) return undefined;
  const signed = rawCode >= 128 && rawCode <= 255 ? rawCode - 256 : rawCode;
  const name = Object.hasOwn(named, signed) ? named[signed] : undefined;
  return name === undefined
    ? { code: 'unknown-exit-code', engine, exitCode: rawCode }
    : { code: 'exit-code', engine, exitCode: rawCode, name };
};
