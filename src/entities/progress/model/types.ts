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

/** Everything that makes up the user's progress; the unit stored locally and exported to a file. */
export type ProgressSnapshot = { grades: Record<string, GradeProgress>; lastVisited: LastVisited | null }

/** School mark for the control work. */
export type SchoolMark = 2 | 3 | 4 | 5
