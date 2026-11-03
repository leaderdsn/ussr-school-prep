import { describe, expect, it } from 'vitest'

import { changeKind, createQuestion, linesToList, removeOption } from './draft'

import type { QuizQuestion } from '@/entities/subject'

const multiple: QuizQuestion = {
  kind: 'multiple',
  type: 'practice',
  topic: 2,
  question: 'Выбери',
  options: ['a', 'b', 'c', 'd'],
  answers: [1, 3],
  explanation: '!',
}

describe('черновик вопроса', () => {
  it('разбирает допустимые ответы по строкам', () => {
    expect(linesToList(' 10 \n\n10 см\n')).toEqual(['10', '10 см'])
  })

  it('при смене вида сохраняет текст, варианты и отметки', () => {
    expect(changeKind(multiple, 'single')).toMatchObject({ kind: 'single', topic: 2, options: multiple.options, answer: 1 })
    expect(changeKind(changeKind(multiple, 'single'), 'multiple')).toMatchObject({ answers: [0, 1] })
    expect(changeKind(multiple, 'input')).toEqual({ kind: 'input', type: 'practice', topic: 2, question: 'Выбери', explanation: '!', answers: [] })
  })

  it('удаляя вариант, сдвигает отметки правильных ответов', () => {
    expect(removeOption(multiple, 0)).toMatchObject({ options: ['b', 'c', 'd'], answers: [0, 2] })
    expect(removeOption(multiple, 1)).toMatchObject({ options: ['a', 'c', 'd'], answers: [2] })

    const single = { ...createQuestion(), options: ['a', 'b', 'c'], answer: 2 }
    expect(removeOption(single, 0)).toMatchObject({ answer: 1 })
    expect(removeOption(single, 2)).toMatchObject({ answer: 0 })
  })
})
