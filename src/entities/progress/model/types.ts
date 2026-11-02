import type { GradeStep } from '@/shared/config'

export type ResultKind = 'test' | 'control'

export type Attempts = {
  /** Percent 0..100. */
  bestScore: number | null
  lastScore: number | null
  attempts: number
  /** ISO date of the first result that passed. */
  passedAt: string | null
}

export type GradeProgress = {
  /** Sorted unique topic indexes. */
  seenTopics: number[]
  test: Attempts
  control: Attempts
}

export type LastVisited = { gradeId: string; step: GradeStep }

/** A question of the test or a task of the control work answered wrong or left empty. */
export type Mistake = {
  /** Index in `quiz` (test) or `control` (control work) of the grade file. */
  index: number
  topic: number
  /** What the child answered, as shown on screen; empty when there was no answer. */
  given: string
}

/** One finished test or control work. */
export type AttemptRecord = {
  id: string
  gradeId: string
  kind: ResultKind
  /** ISO date of the check. */
  at: string
  percent: number
  /** Time from opening the test to the check, seconds. */
  durationSec: number
  mistakes: Mistake[]
}

/** Date in local time `YYYY-MM-DD` -> seconds of active study. */
export type Activity = Record<string, number>

export type ChildProgress = {
  grades: Record<string, GradeProgress>
  lastVisited: LastVisited | null
  /** Oldest first. */
  history: AttemptRecord[]
  activity: Activity
}

export type Child = {
  id: string
  name: string
  createdAt: string
}

/** One child's profile with everything they have done; the unit stored and synced. */
export type ChildRecord = { profile: Child; progress: ChildProgress }

/** The whole family on this device / in the account: child id -> record. */
export type FamilySnapshot = Record<string, ChildRecord>

/** School mark for the control work. */
export type SchoolMark = 2 | 3 | 4 | 5
