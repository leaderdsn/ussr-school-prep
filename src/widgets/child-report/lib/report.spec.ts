import { describe, expect, it } from 'vitest'

import { activityDays, formatDuration, gradeRows, mistakeDetail, mistakeGroups, reportTotals } from './report'

import type { AttemptRecord, ChildProgress } from '@/entities/progress'
import type { Grade } from '@/entities/subject'

const empty = { bestScore: null, lastScore: null, attempts: 0, passedAt: null }

function attempt(id: string, at: string, overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return { id, gradeId: 'math-1', kind: 'test', at, percent: 70, durationSec: 30, mistakes: [], ...overrides }
}

const progress: ChildProgress = {
  grades: {
    'math-1': {
      seenTopics: [0, 1, 2],
      test: { ...empty, bestScore: 90, attempts: 2, passedAt: '2026-11-01T10:00:00.000Z' },
      control: { ...empty, bestScore: 75, attempts: 1, passedAt: '2026-11-01T11:00:00.000Z' },
    },
    'unknown-9': { seenTopics: [0], test: empty, control: empty },
  },
  lastVisited: null,
  history: [
    attempt('1', '2026-11-01T09:00:00.000Z', { mistakes: [{ index: 0, topic: 0, given: '5' }] }),
    attempt('2', '2026-11-01T10:00:00.000Z', { percent: 90, mistakes: [{ index: 4, topic: 1, given: '' }] }),
    attempt('3', '2026-11-01T11:00:00.000Z', { kind: 'control', percent: 75, mistakes: [] }),
  ],
  activity: { '2026-11-02': 1200, '2026-10-30': 600, '2026-10-01': 6000 },
}

const today = new Date(2026, 10, 2, 12)

describe('отчёт для родителя', () => {
  it('строит дни активности, включая пустые', () => {
    const days = activityDays(progress.activity, 7, today)

    expect(days).toHaveLength(7)
    expect(days[days.length - 1]).toMatchObject({ day: '2026-11-02', minutes: 20 })
    expect(days.find((day) => day.day === '2026-10-30')?.minutes).toBe(10)
    expect(days.filter((day) => day.minutes === 0)).toHaveLength(5)
  })

  it('считает итоги', () => {
    expect(reportTotals(progress, today)).toEqual({
      minutesWeek: 30,
      minutesTotal: 130,
      studyDays: 3,
      testsPassed: 1,
      controlsPassed: 1,
      averageMark: 4,
    })
  })

  it('показывает только известные классы', () => {
    const rows = gradeRows(progress)

    expect(rows.map((row) => row.gradeId)).toEqual(['math-1'])
    expect(rows[0]).toMatchObject({ seenTopics: 3, testBest: 90, testPassed: true, controlMark: 4 })
  })

  it('берёт ошибки только из последней попытки и называет темы', () => {
    const groups = mistakeGroups(progress)

    expect(groups).toHaveLength(1)
    expect(groups[0]!.attempt.id).toBe('2')
    expect(groups[0]!.topics).toEqual([{ index: 1, title: 'Сложение и вычитание в пределах 10' }])
  })

  it('достаёт текст вопроса и правильный ответ', () => {
    const grade = {
      quiz: [
        { kind: 'multiple', options: ['a', 'b', 'c'], answers: [0, 2], question: 'Выбери', topic: 0, type: 'theory', explanation: '' },
      ],
      control: [{ topic: 0, text: 'Задача', points: 2, answers: ['9', '9 шт'], solution: '' }],
    } as unknown as Grade

    expect(mistakeDetail(grade, 'test', { index: 0, topic: 0, given: 'a' })).toEqual({ text: 'Выбери', given: 'a', correct: 'a; c' })
    expect(mistakeDetail(grade, 'control', { index: 0, topic: 0, given: '' })).toEqual({ text: 'Задача', given: '', correct: '9' })
    expect(mistakeDetail(grade, 'control', { index: 5, topic: 0, given: '' })).toBeNull()
  })

  it.each([
    [45, '45 с'],
    [600, '10 мин'],
    [5400, '1 ч 30 мин'],
  ])('formatDuration(%i) → %s', (seconds, label) => {
    expect(formatDuration(seconds)).toBe(label)
  })
})
