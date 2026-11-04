/**
 * Content validator: shared by the app tests and `scripts/content.ts` (runs under plain Node,
 * so this file imports only types and other self-contained `.ts` files with explicit extensions).
 */
import { normalizeAnswer } from './answer.ts'

import type { Grade, GradeNumber, GradeSummary, Subject } from '../model/types'

export const CONTENT_LIMITS = {
  topics: { min: 4, max: 12 },
  topicWords: { min: 300, max: 1500 },
  // Reading books hold whole stories, so their topics may be longer.
  readingTopicWords: { min: 300, max: 20000 },
  exercises: { min: 3, max: 10 },
  quiz: { min: 10, max: 12 },
  control: { min: 5, max: 7 },
  points: { min: 1, max: 10 },
} as const

/**
 * Text classes, plus classes for drawings: `accent` (subject colour), `red` (teacher's pen),
 * `muted`, `thin`, `dashed`, `soft` (light fill). Colours of drawings come only from these classes,
 * so figures follow the light and dark themes.
 */
export const ALLOWED_CLASSES: readonly string[] = [
  'rule', 'example', 'formula', 'note', 'table-wrap',
  'accent', 'red', 'muted', 'thin', 'dashed', 'soft',
]

export const ALLOWED_TAGS: readonly string[] = [
  'p', 'h3', 'h4', 'b', 'strong', 'i', 'em', 'u', 'br', 'sup', 'sub', 'small', 'span', 'div',
  'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  // Figures: <figure><svg viewBox="…" role="img" aria-label="…">…</svg><figcaption>…</figcaption></figure>
  'figure', 'figcaption',
  'svg', 'g', 'defs', 'marker', 'line', 'polyline', 'polygon', 'rect', 'circle', 'ellipse', 'path', 'text', 'tspan',
]

const ALLOWED_ATTRIBUTES: readonly string[] = [
  'class', 'colspan', 'rowspan',
  'viewbox', 'role', 'aria-label', 'id',
  'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'width', 'height', 'points', 'd', 'transform',
  'stroke', 'fill', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'font-size', 'font-style', 'font-weight', 'text-anchor', 'dominant-baseline', 'dx', 'dy',
  'marker-start', 'marker-end', 'refx', 'refy', 'markerwidth', 'markerheight', 'orient', 'markerunits',
]

/** Explicit colours would break the dark theme: stroke and fill may only be none or currentColor. */
const COLOR_ATTRIBUTES: readonly string[] = ['stroke', 'fill']
const ALLOWED_COLORS: readonly string[] = ['none', 'currentcolor']
const MARKER_LINK = /^url\(#[\w-]+\)$/
const ATTRIBUTE = /\s([^\s=/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

const SUBJECT_ID = /^[a-z][a-z0-9-]*$/

type Issues = string[]
type Record_ = Record<string, unknown>

function isRecord(value: unknown): value is Record_ {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

function isGradeNumber(value: unknown): value is GradeNumber {
  return isInt(value, 1, 11)
}

function isTextArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 && value.every(isText)
}

function inRange(count: number, limit: { min: number; max: number }): boolean {
  return count >= limit.min && count <= limit.max
}

function hasDuplicates(values: readonly unknown[]): boolean {
  return new Set(values).size !== values.length
}

/** Words of the visible text: tags are dropped, tokens without letters or digits are ignored. */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}

/** Checks that HTML uses only the allowed tags, attributes and classes and contains no scripts. */
export function checkHtml(html: string, path: string): Issues {
  const issues: Issues = []
  if (!isText(html)) return [`${path}: пустой HTML`]
  if (/javascript:/i.test(html)) issues.push(`${path}: запрещено «javascript:»`)

  for (const [, closing, rawName, attrs] of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g)) {
    const name = rawName!.toLowerCase()
    if (!ALLOWED_TAGS.includes(name)) {
      issues.push(`${path}: тег <${name}> не разрешён`)
      continue
    }
    if (closing) continue

    // An attribute is a name after whitespace with an optional value in double, single or no quotes;
    // values are consumed whole, so their contents (minus signs, words) are never read as names.
    for (const [, attrName, doubleQuoted, singleQuoted, unquoted] of attrs!.matchAll(ATTRIBUTE)) {
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? ''
      const attr = attrName!.toLowerCase()
      if (!ALLOWED_ATTRIBUTES.includes(attr)) {
        issues.push(`${path}: атрибут «${attr}» в <${name}> не разрешён`)
      } else if (attr === 'class') {
        for (const cls of value.split(/\s+/).filter(Boolean)) {
          if (!ALLOWED_CLASSES.includes(cls)) issues.push(`${path}: класс «${cls}» не разрешён`)
        }
      } else if (COLOR_ATTRIBUTES.includes(attr) && !ALLOWED_COLORS.includes(value.toLowerCase())) {
        issues.push(`${path}: ${attr}="${value}" — цвет задавайте классом (accent, red, muted, soft)`)
      } else if (/url\(/i.test(value) && !MARKER_LINK.test(value)) {
        issues.push(`${path}: в «${attr}» допустима только ссылка на маркер url(#id)`)
      }
    }
    if (name === 'svg') {
      if (!/\bviewbox\s*=/i.test(attrs!)) issues.push(`${path}: у <svg> нужен viewBox`)
      if (!/\baria-label\s*=\s*"[^"]+"/i.test(attrs!)) issues.push(`${path}: у <svg> нужен aria-label с описанием рисунка`)
    }
  }
  return issues
}

export function validateSubjects(data: unknown): Issues {
  if (!Array.isArray(data)) return ['subjects.json: ожидается массив предметов']
  const issues: Issues = []
  const ids = new Set<string>()

  data.forEach((raw, index) => {
    const path = `subjects[${index}]`
    if (!isRecord(raw)) {
      issues.push(`${path}: ожидается объект`)
      return
    }
    const { id, title, era, description, grades, textbooks, gradeDescriptions } = raw

    if (typeof id !== 'string' || !SUBJECT_ID.test(id)) issues.push(`${path}.id: латиница в kebab-case`)
    else if (ids.has(id)) issues.push(`${path}.id: повтор «${id}»`)
    else ids.add(id)

    if (!isText(title)) issues.push(`${path}.title: пусто`)
    if (era !== 'ussr' && era !== 'rf') issues.push(`${path}.era: "ussr" или "rf"`)
    if (!isText(description)) issues.push(`${path}.description: пусто`)

    const gradeList: number[] = Array.isArray(grades) && grades.every(isGradeNumber) ? grades : []
    if (gradeList.length === 0 || gradeList.some((grade, i) => i > 0 && grade <= gradeList[i - 1]!)) {
      issues.push(`${path}.grades: возрастающий список классов 1–11`)
    }

    if (!Array.isArray(textbooks) || !textbooks.every(isText)) issues.push(`${path}.textbooks: массив строк`)
    else if (era === 'ussr' && textbooks.length === 0) issues.push(`${path}.textbooks: укажите советские учебники`)

    if (!isRecord(gradeDescriptions)) {
      issues.push(`${path}.gradeDescriptions: ожидается объект`)
    } else {
      for (const [key, value] of Object.entries(gradeDescriptions)) {
        if (!gradeList.includes(Number(key))) issues.push(`${path}.gradeDescriptions.${key}: класса нет в grades`)
        if (!isText(value)) issues.push(`${path}.gradeDescriptions.${key}: пусто`)
      }
    }
  })
  return issues
}

function validateExercises(raw: unknown, path: string, issues: Issues) {
  const { exercises } = CONTENT_LIMITS
  const count = Array.isArray(raw) ? raw.length : 0
  if (!Array.isArray(raw) || !inRange(count, exercises)) {
    issues.push(`${path}: нужно ${exercises.min}–${exercises.max} заданий в тетрадь, сейчас ${count}`)
    return
  }
  raw.forEach((exercise, index) => {
    const at = `${path}[${index}]`
    if (!isRecord(exercise)) {
      issues.push(`${at}: ожидается объект`)
      return
    }
    for (const field of ['text', 'answer'] as const) {
      const value = exercise[field]
      if (typeof value === 'string') issues.push(...checkHtml(value, `${at}.${field}`))
      else issues.push(`${at}.${field}: ожидается строка`)
    }
  })
}

function validateTopics(raw: unknown, issues: Issues, subjectId: unknown): number {
  if (!Array.isArray(raw)) {
    issues.push('topics: ожидается массив')
    return 0
  }
  const { topics } = CONTENT_LIMITS
  const topicWords = subjectId === 'reading' ? CONTENT_LIMITS.readingTopicWords : CONTENT_LIMITS.topicWords
  if (!inRange(raw.length, topics)) issues.push(`topics: нужно ${topics.min}–${topics.max} тем, сейчас ${raw.length}`)

  const titles: unknown[] = []
  raw.forEach((topic, index) => {
    const path = `topics[${index}]`
    if (!isRecord(topic)) {
      issues.push(`${path}: ожидается объект`)
      return
    }
    titles.push(topic.title)
    if (!isText(topic.title)) issues.push(`${path}.title: пусто`)

    if (typeof topic.html === 'string') {
      issues.push(...checkHtml(topic.html, `${path}.html`))
      const words = countWords(topic.html)
      if (!inRange(words, topicWords)) {
        issues.push(`${path}.html: нужно ${topicWords.min}–${topicWords.max} слов, сейчас ${words}`)
      }
    } else {
      issues.push(`${path}.html: ожидается строка`)
    }

    validateExercises(topic.exercises, `${path}.exercises`, issues)

    if (typeof topic.compare === 'string') issues.push(...checkHtml(topic.compare, `${path}.compare`))
    else issues.push(`${path}.compare: ожидается строка`)
  })
  if (hasDuplicates(titles)) issues.push('topics: названия тем повторяются')
  return raw.length
}

function checkOptions(question: Record_, path: string, issues: Issues): number {
  const { options } = question
  if (!isTextArray(options) || options.length < 2) {
    issues.push(`${path}.options: минимум два варианта`)
    return 0
  }
  if (hasDuplicates(options.map(normalizeAnswer))) issues.push(`${path}.options: варианты повторяются`)
  return options.length
}

function checkAcceptedAnswers(answers: unknown, path: string, issues: Issues) {
  if (!isTextArray(answers)) issues.push(`${path}: перечислите допустимые ответы строками`)
}

function validateQuiz(raw: unknown, topicCount: number, issues: Issues) {
  if (!Array.isArray(raw)) {
    issues.push('quiz: ожидается массив')
    return
  }
  const { quiz } = CONTENT_LIMITS
  if (!inRange(raw.length, quiz)) issues.push(`quiz: нужно ${quiz.min}–${quiz.max} вопросов, сейчас ${raw.length}`)

  const kinds = new Set<unknown>()
  const types = new Set<unknown>()
  const coveredTopics = new Set<unknown>()

  raw.forEach((question, index) => {
    const path = `quiz[${index}]`
    if (!isRecord(question)) {
      issues.push(`${path}: ожидается объект`)
      return
    }
    kinds.add(question.kind)
    types.add(question.type)
    coveredTopics.add(question.topic)

    if (!isInt(question.topic, 0, topicCount - 1)) issues.push(`${path}.topic: индекс темы 0–${topicCount - 1}`)
    if (question.type !== 'theory' && question.type !== 'practice') issues.push(`${path}.type: "theory" или "practice"`)
    if (!isText(question.question)) issues.push(`${path}.question: пусто`)
    if (!isText(question.explanation)) issues.push(`${path}.explanation: пусто`)

    switch (question.kind) {
      case 'single': {
        const count = checkOptions(question, path, issues)
        if (!isInt(question.answer, 0, count - 1)) issues.push(`${path}.answer: индекс варианта 0–${count - 1}`)
        break
      }
      case 'multiple': {
        const count = checkOptions(question, path, issues)
        const { answers } = question
        if (
          !Array.isArray(answers) ||
          answers.length < 2 ||
          !answers.every((answer) => isInt(answer, 0, count - 1)) ||
          hasDuplicates(answers)
        ) {
          issues.push(`${path}.answers: минимум два разных индекса вариантов`)
        }
        break
      }
      case 'input':
        checkAcceptedAnswers(question.answers, `${path}.answers`, issues)
        break
      default:
        issues.push(`${path}.kind: "single", "multiple" или "input"`)
    }
  })

  for (const kind of ['single', 'multiple', 'input']) {
    if (!kinds.has(kind)) issues.push(`quiz: нет ни одного вопроса вида "${kind}"`)
  }
  for (const type of ['theory', 'practice']) {
    if (!types.has(type)) issues.push(`quiz: нет ни одного вопроса типа "${type}"`)
  }
  for (let topic = 0; topic < topicCount; topic++) {
    if (!coveredTopics.has(topic)) issues.push(`quiz: по теме ${topic} нет вопросов`)
  }
}

function validateControl(raw: unknown, topicCount: number, issues: Issues) {
  if (!Array.isArray(raw)) {
    issues.push('control: ожидается массив')
    return
  }
  const { control, points } = CONTENT_LIMITS
  if (!inRange(raw.length, control)) issues.push(`control: нужно ${control.min}–${control.max} заданий, сейчас ${raw.length}`)

  raw.forEach((task, index) => {
    const path = `control[${index}]`
    if (!isRecord(task)) {
      issues.push(`${path}: ожидается объект`)
      return
    }
    if (!isInt(task.topic, 0, topicCount - 1)) issues.push(`${path}.topic: индекс темы 0–${topicCount - 1}`)
    if (!isText(task.text)) issues.push(`${path}.text: пусто`)
    if (!isInt(task.points, points.min, points.max)) issues.push(`${path}.points: целое ${points.min}–${points.max}`)
    checkAcceptedAnswers(task.answers, `${path}.answers`, issues)
    if (typeof task.solution === 'string') issues.push(...checkHtml(task.solution, `${path}.solution`))
    else issues.push(`${path}.solution: ожидается строка`)
  })
}

/** `fileName` is the name without extension, e.g. "math-1". */
export function validateGrade(data: unknown, subjects: readonly Subject[], fileName?: string): Issues {
  if (!isRecord(data)) return ['ожидается объект класса']
  const issues: Issues = []
  const { id, subjectId, grade, ussrGrade, textbook } = data

  const subject = subjects.find((item) => item.id === subjectId)
  if (!subject) issues.push(`subjectId: предмета «${String(subjectId)}» нет в subjects.json`)

  if (!isGradeNumber(grade)) {
    issues.push('grade: число 1–11')
  } else if (subject) {
    if (!subject.grades.includes(grade)) issues.push(`grade: ${grade} класса нет в subjects.json → grades`)
    if (!isText(subject.gradeDescriptions[`${grade}`])) {
      issues.push(`grade: добавьте gradeDescriptions["${grade}"] для «${subject.id}» в subjects.json`)
    }
  }

  const expectedId = `${String(subjectId)}-${String(grade)}`
  if (id !== expectedId) issues.push(`id: ожидается «${expectedId}»`)
  if (fileName !== undefined && fileName !== id) issues.push(`id: должен совпадать с именем файла «${fileName}»`)

  if (ussrGrade !== undefined && (!isInt(ussrGrade, 1, 10) || ussrGrade === grade)) {
    issues.push('ussrGrade: советский класс 1–10, только если отличается от grade')
  }
  if (!isText(textbook)) issues.push('textbook: укажите учебник')

  const topicCount = validateTopics(data.topics, issues, subjectId)
  validateQuiz(data.quiz, topicCount, issues)
  validateControl(data.control, topicCount, issues)
  return issues
}

export function summarizeGrade(grade: Grade): GradeSummary {
  return {
    id: grade.id,
    subjectId: grade.subjectId,
    grade: grade.grade,
    ...(grade.ussrGrade === undefined ? {} : { ussrGrade: grade.ussrGrade }),
    textbook: grade.textbook,
    topicTitles: grade.topics.map((topic) => topic.title),
    quizCount: grade.quiz.length,
    controlCount: grade.control.length,
    controlPoints: grade.control.reduce((sum, task) => sum + task.points, 0),
  }
}
