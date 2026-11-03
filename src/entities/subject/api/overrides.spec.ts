import { describe, expect, it, vi } from 'vitest'

import { applyOverride, parseOverride } from './overrides'

import type { GradeOverride } from './overrides'
import type { ControlTask, Grade, QuizQuestion, Subject } from '../model/types'

const subjects: Subject[] = [
  { id: 'math', title: 'Математика', era: 'ussr', description: '-', grades: [1], textbooks: ['Моро'], gradeDescriptions: { '1': '-' } },
]

const question = (topic: number, kind: 'single' | 'multiple' | 'input'): QuizQuestion => {
  const base = { topic, type: topic % 2 ? 'practice' : 'theory', question: 'Вопрос?', explanation: '!' } as const
  if (kind === 'single') return { ...base, kind, options: ['а', 'б'], answer: 0 }
  if (kind === 'multiple') return { ...base, kind, options: ['а', 'б', 'в'], answers: [0, 1] }
  return { ...base, kind, answers: ['1'] }
}

const quiz: QuizQuestion[] = Array.from({ length: 10 }, (_, i) =>
  question(i % 4, (['single', 'multiple', 'input'] as const)[i % 3]!),
)
const control: ControlTask[] = Array.from({ length: 5 }, (_, i) => ({
  topic: i % 4,
  text: `Задание ${i + 1}`,
  points: 2,
  answers: ['5'],
  solution: '<p>Решение</p>',
}))

const grade = {
  id: 'math-1',
  subjectId: 'math',
  grade: 1,
  textbook: 'Моро',
  topics: Array.from({ length: 4 }, (_, i) => ({ title: `Тема ${i + 1}`, html: '<p>-</p>', exercises: [], compare: '<p>-</p>' })),
  quiz: [],
  control: [],
} as Grade

const override: GradeOverride = { quiz, control, updatedAt: '2026-11-03T10:00:00.000Z', updatedBy: 'admin@example.com' }

describe('правки из админки', () => {
  it('подставляет корректную правку теста и контрольной', () => {
    const result = applyOverride(grade, override, subjects)

    expect(result.quiz).toHaveLength(10)
    expect(result.control).toHaveLength(5)
    expect(result.topics).toBe(grade.topics)
  })

  it('не применяет правку с ошибками и оставляет класс из сборки', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const broken = { ...override, control: control.slice(0, 2) }

    expect(applyOverride(grade, broken, subjects)).toBe(grade)
    expect(console.warn).toHaveBeenCalled()
  })

  it.each([null, 'x', { quiz: [] }, { control: [] }])('не принимает мусор из базы: %j', (raw) => {
    expect(parseOverride(raw)).toBeNull()
  })

  it('разбирает запись из базы', () => {
    expect(parseOverride(override)).toEqual(override)
  })
})
