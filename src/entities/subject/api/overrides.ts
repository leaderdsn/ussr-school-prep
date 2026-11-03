import { validateGrade } from '../lib/validate'

import type { ControlTask, Grade, QuizQuestion, Subject } from '../model/types'

/**
 * Tests and control works edited in the admin panel live in Firebase Realtime Database at
 * `schoolPrep/content/<gradeId>` (public read, admin write — see database.rules.json) and replace
 * the bundled ones. The rest of the grade (topics, exercises) always comes from the bundle.
 */
export const contentPath = (gradeId: string) => `schoolPrep/content/${gradeId}`

export type GradeOverride = {
  quiz: QuizQuestion[]
  control: ControlTask[]
  /** ISO date of the last save and who saved it. */
  updatedAt: string
  updatedBy: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The database keeps lists of objects as arrays, but drops empty ones; a missing list means "no override". */
export function parseOverride(raw: unknown): GradeOverride | null {
  if (!isRecord(raw) || !Array.isArray(raw.quiz) || !Array.isArray(raw.control)) return null
  return {
    quiz: raw.quiz as QuizQuestion[],
    control: raw.control as ControlTask[],
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
    updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : '',
  }
}

/** Problems of the test and control work only: the bundled topics are not the admin's concern. */
export function overrideIssues(grade: Grade, override: Pick<GradeOverride, 'quiz' | 'control'>, subjects: readonly Subject[]) {
  return validateGrade({ ...grade, quiz: override.quiz, control: override.control }, subjects, grade.id).filter(
    (issue) => issue.startsWith('quiz') || issue.startsWith('control'),
  )
}

/** The grade with the override applied, or unchanged when the override is invalid. */
export function applyOverride(grade: Grade, override: GradeOverride | null, subjects: readonly Subject[]): Grade {
  if (!override) return grade
  const issues = overrideIssues(grade, override, subjects)
  if (issues.length > 0) {
    console.warn(`Правка «${grade.id}» из базы не применена:`, issues)
    return grade
  }
  return { ...grade, quiz: override.quiz, control: override.control }
}
