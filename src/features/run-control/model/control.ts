import { schoolMark } from '@/entities/progress'
import { isAnswerAccepted } from '@/entities/subject'

import type { SchoolMark } from '@/entities/progress'
import type { ControlTask } from '@/entities/subject'

/** Task index -> typed answer. */
export type ControlAnswers = Record<number, string>

export type ControlResult = {
  points: number
  maxPoints: number
  percent: number
  mark: SchoolMark
  /** Task index -> solved correctly. */
  solved: boolean[]
}

export function scoreControl(tasks: readonly ControlTask[], answers: ControlAnswers): ControlResult {
  const solved = tasks.map((task, index) => isAnswerAccepted(answers[index] ?? '', task.answers))
  const maxPoints = tasks.reduce((sum, task) => sum + task.points, 0)
  const points = tasks.reduce((sum, task, index) => sum + (solved[index] ? task.points : 0), 0)
  const percent = maxPoints === 0 ? 0 : Math.round((points / maxPoints) * 100)
  return { points, maxPoints, percent, mark: schoolMark(percent), solved }
}
