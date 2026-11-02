import { CONTROL_STEP, TEST_STEP } from '@/shared/config'

import type { Attempts, GradeProgress, LastVisited } from '../model/types'

export function createEmptyAttempts(): Attempts {
  return { bestScore: null, lastScore: null, attempts: 0, passedAt: null }
}

export function createEmptyGrade(): GradeProgress {
  return { seenTopics: [], test: createEmptyAttempts(), control: createEmptyAttempts() }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

function parseScore(value: unknown): number | null | undefined {
  if (value === null) return null
  return isPercent(value) ? value : undefined
}

function parseAttempts(raw: unknown): Attempts | null {
  if (!isRecord(raw)) return null
  const { bestScore, lastScore, attempts, passedAt } = raw
  const best = parseScore(bestScore)
  const last = parseScore(lastScore)
  if (best === undefined || last === undefined) return null
  if (typeof attempts !== 'number' || !Number.isInteger(attempts) || attempts < 0) return null
  if (passedAt !== null && (typeof passedAt !== 'string' || Number.isNaN(Date.parse(passedAt)))) return null
  return { bestScore: best, lastScore: last, attempts, passedAt }
}

/** Returns a clean entry or null when the raw value is malformed. */
export function parseGrade(raw: unknown): GradeProgress | null {
  if (!isRecord(raw)) return null
  const { seenTopics } = raw
  if (!Array.isArray(seenTopics) || !seenTopics.every((i) => Number.isInteger(i) && i >= 0)) return null
  const test = parseAttempts(raw.test)
  const control = parseAttempts(raw.control)
  if (!test || !control) return null

  return { seenTopics: [...new Set(seenTopics as number[])].sort((a, b) => a - b), test, control }
}

export function parseLastVisited(raw: unknown): LastVisited | null {
  if (!isRecord(raw) || typeof raw.gradeId !== 'string' || !raw.gradeId) return null
  const { step } = raw
  if (step === TEST_STEP || step === CONTROL_STEP || (typeof step === 'number' && Number.isInteger(step) && step >= 1)) {
    return { gradeId: raw.gradeId, step }
  }
  return null
}

export function parseGrades(raw: unknown): Record<string, GradeProgress> {
  const result: Record<string, GradeProgress> = {}
  if (!isRecord(raw)) return result
  for (const [id, value] of Object.entries(raw)) {
    const grade = parseGrade(value)
    if (grade) result[id] = grade
  }
  return result
}
