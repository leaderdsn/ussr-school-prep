import type { ResultKind } from '../model/types'

/** Minimum percent that counts as passed: the test needs 80%, the control work a mark of 3 or higher. */
export const PASS_SCORES: Readonly<Record<ResultKind, number>> = {
  test: 80,
  control: 50,
}

export const PROGRESS_STORAGE_KEY = 'ussr-school-prep:progress'

export const PROGRESS_VERSION = 1
