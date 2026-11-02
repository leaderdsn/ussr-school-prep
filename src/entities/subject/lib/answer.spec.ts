import { describe, expect, it } from 'vitest'

import { isAnswerAccepted, normalizeAnswer } from './answer'

describe('normalizeAnswer', () => {
  it.each([
    ['  10  СМ ', '10 см'],
    ['Ёлка', 'елка'],
    ['2,5', '2.5'],
    ['5 − 3', '5-3'],
    ['7 + 3 = 10', '7+3=10'],
    ['ответ.', 'ответ'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected)
  })
})

describe('isAnswerAccepted', () => {
  const accepted = ['10', '10 см', 'на 10']

  it('принимает любую перечисленную форму', () => {
    expect(isAnswerAccepted('10', accepted)).toBe(true)
    expect(isAnswerAccepted(' 10 См ', accepted)).toBe(true)
    expect(isAnswerAccepted('на 10', accepted)).toBe(true)
  })

  it('не принимает другое и пустое', () => {
    expect(isAnswerAccepted('11', accepted)).toBe(false)
    expect(isAnswerAccepted('   ', accepted)).toBe(false)
  })
})
