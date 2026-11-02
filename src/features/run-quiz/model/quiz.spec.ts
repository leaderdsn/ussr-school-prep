import { describe, expect, it } from 'vitest'

import { createQuizSession, isAnswered, isQuestionCorrect, scoreQuiz } from './quiz'

import type { QuizQuestion } from '@/entities/subject'

const base = { topic: 0, question: '?', explanation: '!' }

const questions: QuizQuestion[] = [
  { ...base, type: 'theory', kind: 'single', options: ['a', 'b', 'c'], answer: 1 },
  { ...base, type: 'practice', kind: 'multiple', options: ['a', 'b', 'c', 'd'], answers: [0, 2] },
  { ...base, type: 'practice', kind: 'input', answers: ['10', '10 см'] },
]

describe('isQuestionCorrect', () => {
  it.each([
    [0, 1, true],
    [0, 0, false],
    [1, [2, 0], true],
    [1, [0], false],
    [1, [0, 2, 3], false],
    [2, ' 10 СМ ', true],
    [2, '11', false],
    [2, undefined, false],
  ] as const)('вопрос %i, ответ %j → %s', (index, answer, expected) => {
    expect(isQuestionCorrect(questions[index]!, answer as never)).toBe(expected)
  })
})

describe('scoreQuiz', () => {
  it('считает процент, ошибки и разбивку по типам', () => {
    const result = scoreQuiz(questions, { 0: 1, 1: [0], 2: '10' })

    expect(result).toMatchObject({ correct: 2, total: 3, percent: 67, wrong: [1] })
    expect(result.byType).toEqual({ theory: { correct: 1, total: 1 }, practice: { correct: 1, total: 2 } })
  })
})

describe('createQuizSession', () => {
  it('перемешивает вопросы и варианты, не трогая вопросы с вводом', () => {
    const session = createQuizSession(questions, () => 0)

    expect(session.map((item) => item.questionIndex).sort()).toEqual([0, 1, 2])
    const input = session.find((item) => item.questionIndex === 2)!
    expect(input.optionOrder).toEqual([])
    const multiple = session.find((item) => item.questionIndex === 1)!
    expect([...multiple.optionOrder].sort()).toEqual([0, 1, 2, 3])
  })
})

describe('isAnswered', () => {
  it.each([
    [undefined, false],
    ['  ', false],
    [[], false],
    [0, true],
    [[1], true],
    ['5', true],
  ] as const)('%j → %s', (answer, expected) => {
    expect(isAnswered(answer as never)).toBe(expected)
  })
})
