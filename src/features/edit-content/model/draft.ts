import type { ControlTask, QuizQuestion } from '@/entities/subject'

export type QuestionKind = QuizQuestion['kind']

export const KIND_LABELS: Readonly<Record<QuestionKind, string>> = {
  single: 'Один ответ',
  multiple: 'Несколько ответов',
  input: 'Ввод ответа',
}

/** Accepted answers are edited as text, one form per line. */
export function linesToList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function listToLines(list: readonly string[]): string {
  return list.join('\n')
}

export function createQuestion(topic = 0): QuizQuestion {
  return { kind: 'single', type: 'theory', topic, question: '', options: ['', ''], answer: 0, explanation: '' }
}

export function createTask(topic = 0): ControlTask {
  return { topic, text: '', points: 2, answers: [], solution: '<p></p>' }
}

/** Keeps the shared fields and the options when switching between single, multiple and input. */
export function changeKind(question: QuizQuestion, kind: QuestionKind): QuizQuestion {
  const { topic, type, question: text, explanation } = question
  const base = { topic, type, question: text, explanation }
  const options = question.kind === 'input' ? ['', ''] : question.options
  const correct = question.kind === 'single' ? [question.answer] : question.kind === 'multiple' ? question.answers : []

  switch (kind) {
    case 'single':
      return { ...base, kind, options, answer: correct[0] ?? 0 }
    case 'multiple':
      return { ...base, kind, options, answers: correct.length >= 2 ? correct : [0, 1] }
    case 'input':
      return { ...base, kind, answers: question.kind === 'input' ? question.answers : [] }
  }
}

/** Removes an option and keeps the marks of correct answers pointing at the same options. */
export function removeOption(question: QuizQuestion, index: number): QuizQuestion {
  if (question.kind === 'input') return question
  const options = question.options.filter((_, i) => i !== index)
  const shift = (i: number) => (i > index ? i - 1 : i)
  if (question.kind === 'single') {
    return { ...question, options, answer: question.answer === index ? 0 : shift(question.answer) }
  }
  return { ...question, options, answers: question.answers.filter((i) => i !== index).map(shift) }
}
