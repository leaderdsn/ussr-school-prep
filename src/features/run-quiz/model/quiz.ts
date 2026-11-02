import { isAnswerAccepted } from '@/entities/subject'

import type { QuestionType, QuizQuestion } from '@/entities/subject'

export type QuizItem = {
  questionIndex: number
  /** Original option indexes in display order; empty for `input` questions. */
  optionOrder: number[]
}

/** Answer to one question: option index (single), option indexes (multiple) or typed text (input). */
export type QuizAnswer = number | number[] | string

/** Question index -> answer in ORIGINAL option indexes. */
export type QuizAnswers = Record<number, QuizAnswer>

export type QuizResult = {
  correct: number
  total: number
  percent: number
  /** Questions answered wrong or left unanswered. */
  wrong: number[]
  byType: Record<QuestionType, { correct: number; total: number }>
}

function shuffledIndexes(length: number, random: () => number): number[] {
  const items = Array.from({ length }, (_, i) => i)
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = items[i]!
    items[i] = items[j]!
    items[j] = tmp
  }
  return items
}

export function createQuizSession(questions: QuizQuestion[], random: () => number = Math.random): QuizItem[] {
  return shuffledIndexes(questions.length, random).map((questionIndex) => {
    const question = questions[questionIndex]!
    return {
      questionIndex,
      optionOrder: question.kind === 'input' ? [] : shuffledIndexes(question.options.length, random),
    }
  })
}

export function isAnswered(answer: QuizAnswer | undefined): boolean {
  if (answer === undefined) return false
  if (typeof answer === 'string') return answer.trim() !== ''
  if (Array.isArray(answer)) return answer.length > 0
  return true
}

export function isQuestionCorrect(question: QuizQuestion, answer: QuizAnswer | undefined): boolean {
  switch (question.kind) {
    case 'single':
      return answer === question.answer
    case 'multiple':
      return (
        Array.isArray(answer) &&
        answer.length === question.answers.length &&
        question.answers.every((index) => answer.includes(index))
      )
    case 'input':
      return typeof answer === 'string' && isAnswerAccepted(answer, question.answers)
  }
}

export function scoreQuiz(questions: QuizQuestion[], answers: QuizAnswers): QuizResult {
  const byType: QuizResult['byType'] = { theory: { correct: 0, total: 0 }, practice: { correct: 0, total: 0 } }
  const wrong: number[] = []
  let correct = 0

  questions.forEach((question, index) => {
    const bucket = byType[question.type]
    bucket.total += 1
    if (isQuestionCorrect(question, answers[index])) {
      correct += 1
      bucket.correct += 1
    } else {
      wrong.push(index)
    }
  })

  const total = questions.length
  return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100), wrong, byType }
}

/** The answer as the child saw it, for the parent's report; empty when unanswered. */
export function answerText(question: QuizQuestion, answer: QuizAnswer | undefined): string {
  if (!isAnswered(answer)) return ''
  if (question.kind === 'input') return typeof answer === 'string' ? answer.trim() : ''
  const indexes = Array.isArray(answer) ? [...answer].sort((a, b) => a - b) : [answer as number]
  return indexes.map((index) => question.options[index] ?? '').join('; ')
}
