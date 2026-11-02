import { isRecord } from './parse'

import type { Activity, AttemptRecord, Attempts, ChildProgress, FamilySnapshot, GradeProgress } from '../model/types'

function maxScore(a: number | null, b: number | null): number | null {
  if (a === null) return b
  if (b === null) return a
  return Math.max(a, b)
}

function earliestDate(a: string | null, b: string | null): string | null {
  if (a === null) return b
  if (b === null) return a
  return Date.parse(a) <= Date.parse(b) ? a : b
}

function mergeAttempts(local: Attempts, remote: Attempts): Attempts {
  return {
    bestScore: maxScore(local.bestScore, remote.bestScore),
    // the side with more attempts has seen the latest result
    lastScore: remote.attempts > local.attempts ? remote.lastScore : local.lastScore,
    attempts: Math.max(local.attempts, remote.attempts),
    passedAt: earliestDate(local.passedAt, remote.passedAt),
  }
}

function mergeGrade(local: GradeProgress, remote: GradeProgress): GradeProgress {
  return {
    seenTopics: [...new Set([...local.seenTopics, ...remote.seenTopics])].sort((a, b) => a - b),
    test: mergeAttempts(local.test, remote.test),
    control: mergeAttempts(local.control, remote.control),
  }
}

function mergeHistory(local: AttemptRecord[], remote: AttemptRecord[]): AttemptRecord[] {
  const byId = new Map([...remote, ...local].map((item) => [item.id, item]))
  return [...byId.values()].sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

/** Before the first sync both sides count the same day independently, so the larger value wins. */
function mergeActivity(local: Activity, remote: Activity): Activity {
  const result: Activity = { ...remote }
  for (const [day, seconds] of Object.entries(local)) result[day] = Math.max(seconds, result[day] ?? 0)
  return result
}

export function mergeChildProgress(local: ChildProgress, remote: ChildProgress): ChildProgress {
  const grades: Record<string, GradeProgress> = { ...remote.grades }
  for (const [id, grade] of Object.entries(local.grades)) {
    const other = remote.grades[id]
    grades[id] = other ? mergeGrade(grade, other) : grade
  }
  return {
    grades,
    lastVisited: local.lastVisited ?? remote.lastVisited,
    history: mergeHistory(local.history, remote.history),
    activity: mergeActivity(local.activity, remote.activity),
  }
}

/** Combines the family on this device with the account's family on sign-in; nothing is lost. */
export function mergeFamily(local: FamilySnapshot, remote: FamilySnapshot): FamilySnapshot {
  const family: FamilySnapshot = { ...remote }
  for (const [id, record] of Object.entries(local)) {
    const other = remote[id]
    family[id] = other ? { profile: other.profile, progress: mergeChildProgress(record.progress, other.progress) } : record
  }
  return family
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (!isRecord(value)) return value
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortKeys(value[key])]),
  )
}

/** Key order differs between the database and local state, so compare canonical JSON. */
export function isSameData(a: unknown, b: unknown): boolean {
  return JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b))
}
