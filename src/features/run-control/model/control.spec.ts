import { describe, expect, it } from 'vitest'

import { scoreControl } from './control'

import type { ControlTask } from '@/entities/subject'

const task = (points: number, answers: string[]): ControlTask => ({ topic: 0, text: '?', points, answers, solution: '<p>!</p>' })

describe('scoreControl', () => {
  const tasks = [task(2, ['5']), task(3, ['4 см', 'на 4']), task(5, ['9'])]

  it('суммирует баллы решённых заданий и ставит оценку', () => {
    expect(scoreControl(tasks, { 0: '5', 1: 'На 4', 2: '9' })).toEqual({
      points: 10,
      maxPoints: 10,
      percent: 100,
      mark: 5,
      solved: [true, true, true],
    })
    expect(scoreControl(tasks, { 0: '5', 1: '4' })).toMatchObject({ points: 2, percent: 20, mark: 2, solved: [true, false, false] })
    expect(scoreControl(tasks, { 1: '4 см', 2: '9' })).toMatchObject({ points: 8, percent: 80, mark: 4 })
  })
})
