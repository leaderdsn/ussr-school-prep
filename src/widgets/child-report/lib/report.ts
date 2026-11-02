import { dayKey, PASS_SCORES, schoolMark } from '@/entities/progress'
import { findGrade } from '@/entities/subject'

import type { AttemptRecord, ChildProgress, Mistake, ResultKind, SchoolMark } from '@/entities/progress'
import type { Grade, GradeSummary, Subject } from '@/entities/subject'

export type ActivityDay = { day: string; date: Date; minutes: number }

/** The last `days` calendar days ending today, oldest first, including days without study. */
export function activityDays(activity: Record<string, number>, days: number, today: Date = new Date()): ActivityDay[] {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i))
    const day = dayKey(date)
    return { day, date, minutes: Math.round((activity[day] ?? 0) / 60) }
  })
}

export type ReportTotals = {
  minutesWeek: number
  minutesTotal: number
  studyDays: number
  testsPassed: number
  controlsPassed: number
  /** Average of the best control marks over grades with a control work written; null if none. */
  averageMark: number | null
}

export function reportTotals(progress: ChildProgress, today: Date = new Date()): ReportTotals {
  const week = activityDays(progress.activity, 7, today)
  const seconds = Object.values(progress.activity)
  const grades = Object.values(progress.grades)
  const marks = grades.flatMap((grade) => (grade.control.bestScore === null ? [] : [schoolMark(grade.control.bestScore)]))
  return {
    minutesWeek: week.reduce((sum, day) => sum + day.minutes, 0),
    minutesTotal: Math.round(seconds.reduce((sum, value) => sum + value, 0) / 60),
    studyDays: seconds.filter((value) => value > 0).length,
    testsPassed: grades.filter((grade) => grade.test.passedAt !== null).length,
    controlsPassed: grades.filter((grade) => grade.control.passedAt !== null).length,
    averageMark: marks.length ? Math.round((marks.reduce((sum, mark) => sum + mark, 0) / marks.length) * 10) / 10 : null,
  }
}

export type GradeRow = {
  gradeId: string
  subject: Subject
  summary: GradeSummary
  seenTopics: number
  testBest: number | null
  testPassed: boolean
  testAttempts: number
  controlMark: SchoolMark | null
  controlAttempts: number
}

/** Grades the child has opened, in catalog order. */
export function gradeRows(progress: ChildProgress): GradeRow[] {
  return Object.entries(progress.grades).flatMap(([gradeId, grade]) => {
    const found = findGrade(gradeId)
    if (!found) return []
    return [
      {
        gradeId,
        subject: found.subject,
        summary: found.grade,
        seenTopics: Math.min(grade.seenTopics.length, found.grade.topicTitles.length),
        testBest: grade.test.bestScore,
        testPassed: (grade.test.bestScore ?? 0) >= PASS_SCORES.test,
        testAttempts: grade.test.attempts,
        controlMark: grade.control.bestScore === null ? null : schoolMark(grade.control.bestScore),
        controlAttempts: grade.control.attempts,
      },
    ]
  })
}

export function gradeLabel(gradeId: string): string {
  const found = findGrade(gradeId)
  return found ? `${found.subject.title}, ${found.grade.grade} кл.` : gradeId
}

/** Newest first. */
export function recentAttempts(progress: ChildProgress, limit?: number): AttemptRecord[] {
  const items = [...progress.history].reverse()
  return limit === undefined ? items : items.slice(0, limit)
}

export type MistakeGroup = {
  gradeId: string
  kind: ResultKind
  attempt: AttemptRecord
  /** Titles of topics to repeat, by topic index. */
  topics: { index: number; title: string }[]
}

/**
 * What to repeat: for every grade and kind, the mistakes of the LATEST attempt only —
 * errors fixed in a later attempt are no longer shown.
 */
export function mistakeGroups(progress: ChildProgress): MistakeGroup[] {
  const latest = new Map<string, AttemptRecord>()
  for (const attempt of progress.history) latest.set(`${attempt.gradeId}:${attempt.kind}`, attempt)

  return [...latest.values()]
    .filter((attempt) => attempt.mistakes.length > 0)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .map((attempt) => {
      const titles = findGrade(attempt.gradeId)?.grade.topicTitles ?? []
      const indexes = [...new Set(attempt.mistakes.map((mistake) => mistake.topic))].sort((a, b) => a - b)
      return {
        gradeId: attempt.gradeId,
        kind: attempt.kind,
        attempt,
        topics: indexes.map((index) => ({ index, title: titles[index] ?? `Тема ${index + 1}` })),
      }
    })
}

export type MistakeDetail = { text: string; given: string; correct: string }

/** Question or task text and the right answer from the loaded grade file. */
export function mistakeDetail(grade: Grade, kind: ResultKind, mistake: Mistake): MistakeDetail | null {
  if (kind === 'control') {
    const task = grade.control[mistake.index]
    return task ? { text: task.text, given: mistake.given, correct: task.answers[0] ?? '' } : null
  }
  const question = grade.quiz[mistake.index]
  if (!question) return null
  let correct: string
  if (question.kind === 'single') correct = question.options[question.answer] ?? ''
  else if (question.kind === 'multiple') correct = question.answers.map((i) => question.options[i] ?? '').join('; ')
  else correct = question.answers[0] ?? ''
  return { text: question.question, given: mistake.given, correct }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} с`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} мин`
  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`
}

export function resultLabel(attempt: AttemptRecord): string {
  return attempt.kind === 'control' ? `«${schoolMark(attempt.percent)}», ${attempt.percent}%` : `${attempt.percent}%`
}

export function isPassed(attempt: AttemptRecord): boolean {
  return attempt.percent >= PASS_SCORES[attempt.kind]
}

