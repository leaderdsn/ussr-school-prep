import { CONTROL_STEP, TEST_STEP } from '@/shared/config'

import type {
  Activity,
  AttemptRecord,
  Attempts,
  Child,
  ChildProgress,
  FamilySnapshot,
  GradeProgress,
  LastVisited,
  Mistake,
} from '../model/types'

// Parsers accept data from localStorage, imported files and Firebase. The database drops empty arrays,
// empty objects and nulls, so a MISSING field becomes its empty value; a field of the WRONG type rejects the entry.

export function createEmptyAttempts(): Attempts {
  return { bestScore: null, lastScore: null, attempts: 0, passedAt: null }
}

export function createEmptyGrade(): GradeProgress {
  return { seenTopics: [], test: createEmptyAttempts(), control: createEmptyAttempts() }
}

export function createEmptyChildProgress(): ChildProgress {
  return { grades: {}, lastVisited: null, history: [], activity: {} }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPercent(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function parseScore(value: unknown): number | null | undefined {
  if (value === null || value === undefined) return null
  return isPercent(value) ? value : undefined
}

/** Firebase may return a list as an object with numeric keys. */
function asList(value: unknown): unknown[] | null {
  if (value === undefined || value === null) return []
  if (Array.isArray(value)) return value
  return isRecord(value) ? Object.values(value) : null
}

function parseAttempts(raw: unknown): Attempts | null {
  if (raw === undefined) return createEmptyAttempts()
  if (!isRecord(raw)) return null
  const best = parseScore(raw.bestScore)
  const last = parseScore(raw.lastScore)
  const attempts = raw.attempts ?? 0
  const passedAt = raw.passedAt ?? null
  if (best === undefined || last === undefined || !isCount(attempts)) return null
  if (passedAt !== null && !isDate(passedAt)) return null
  return { bestScore: best, lastScore: last, attempts, passedAt }
}

/** Returns a clean entry or null when the raw value is malformed. */
export function parseGrade(raw: unknown): GradeProgress | null {
  if (!isRecord(raw)) return null
  const seenTopics = asList(raw.seenTopics)
  if (!seenTopics || !seenTopics.every(isCount)) return null
  const test = parseAttempts(raw.test)
  const control = parseAttempts(raw.control)
  if (!test || !control) return null

  return { seenTopics: [...new Set(seenTopics)].sort((a, b) => a - b), test, control }
}

export function parseLastVisited(raw: unknown): LastVisited | null {
  if (!isRecord(raw) || typeof raw.gradeId !== 'string' || !raw.gradeId) return null
  const { step } = raw
  if (step === TEST_STEP || step === CONTROL_STEP || (typeof step === 'number' && Number.isInteger(step) && step >= 1)) {
    return { gradeId: raw.gradeId, step }
  }
  return null
}

function parseMistake(raw: unknown): Mistake | null {
  if (!isRecord(raw) || !isCount(raw.index) || !isCount(raw.topic)) return null
  const given = raw.given ?? ''
  return typeof given === 'string' ? { index: raw.index, topic: raw.topic, given } : null
}

export function parseAttempt(raw: unknown): AttemptRecord | null {
  if (!isRecord(raw)) return null
  const { id, gradeId, kind, at, percent, durationSec } = raw
  if (typeof id !== 'string' || !id || typeof gradeId !== 'string' || !gradeId) return null
  if ((kind !== 'test' && kind !== 'control') || !isDate(at) || !isPercent(percent) || !isCount(durationSec)) return null
  const mistakes = asList(raw.mistakes)?.map(parseMistake)
  if (!mistakes || mistakes.some((item) => item === null)) return null
  return { id, gradeId, kind, at, percent, durationSec, mistakes: mistakes as Mistake[] }
}

function parseActivity(raw: unknown): Activity {
  const result: Activity = {}
  if (!isRecord(raw)) return result
  for (const [day, seconds] of Object.entries(raw)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && isCount(seconds)) result[day] = seconds
  }
  return result
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

/** Malformed parts are dropped, the rest is kept. */
export function parseChildProgress(raw: unknown): ChildProgress {
  if (!isRecord(raw)) return createEmptyChildProgress()
  const history = (asList(raw.history) ?? [])
    .map(parseAttempt)
    .filter((item): item is AttemptRecord => item !== null)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  return {
    grades: parseGrades(raw.grades),
    lastVisited: parseLastVisited(raw.lastVisited),
    history,
    activity: parseActivity(raw.activity),
  }
}

export function parseChild(raw: unknown, id: string): Child | null {
  if (!isRecord(raw) || typeof raw.name !== 'string' || !raw.name.trim() || !isDate(raw.createdAt)) return null
  return { id, name: raw.name.trim(), createdAt: raw.createdAt }
}

/** Child id -> record; records without a valid profile are dropped. */
export function parseFamily(raw: unknown): FamilySnapshot {
  const family: FamilySnapshot = {}
  if (!isRecord(raw)) return family
  for (const [id, value] of Object.entries(raw)) {
    if (!isRecord(value)) continue
    const profile = parseChild(value.profile, id)
    if (profile) family[id] = { profile, progress: parseChildProgress(value.progress) }
  }
  return family
}
