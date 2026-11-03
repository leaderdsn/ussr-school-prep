/**
 * Content schema. Grade files live in `data/grades/<subjectId>-<grade>.json`,
 * the catalog in `data/subjects.json`; `lib/validate.ts` checks both against these types.
 */

/** `ussr` — taught by Soviet textbooks; `rf` — the subject did not exist in the USSR, taught by the RF programme. */
export type Era = 'ussr' | 'rf'

/** Modern grade numbering 1–11. */
export type GradeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type Subject = {
  /** Latin kebab-case, used in file names: `math`, `algebra`, `russian`. */
  id: string
  title: string
  era: Era
  description: string
  /** Grades the subject is taught in (modern numbering), in ascending order. */
  grades: GradeNumber[]
  /** Base textbooks, e.g. "М. И. Моро «Математика» (1–3 кл.)". */
  textbooks: string[]
  /** One line per grade that already has content; keys are grade numbers. */
  gradeDescriptions: Partial<Record<`${GradeNumber}`, string>>
}

/** A notebook exercise after a topic, as in a textbook: the child solves it in the exercise book. */
export type Exercise = {
  /** Trusted HTML of the task (may contain a figure). */
  text: string
  /** Trusted HTML of the answer for self-check, shown on request. */
  answer: string
}

export type Topic = {
  title: string
  /**
   * Trusted HTML of the textbook paragraph: explanation, worked examples, figures (inline SVG in a `figure`).
   * Allowed classes and tags are listed in lib/validate.ts.
   */
  html: string
  /** At least three exercises for the notebook, solved before the test. */
  exercises: Exercise[]
  /** HTML of the comparison block: "Сейчас в российской школе" (ussr) or "А как было в СССР" (rf). */
  compare: string
}

export type QuestionType = 'theory' | 'practice'

type QuestionBase = {
  /** Index of the topic inside the grade file that contains the answer. */
  topic: number
  type: QuestionType
  question: string
  explanation: string
}

export type SingleQuestion = QuestionBase & {
  kind: 'single'
  options: string[]
  /** Index of the correct option. */
  answer: number
}

export type MultipleQuestion = QuestionBase & {
  kind: 'multiple'
  options: string[]
  /** Indexes of all correct options (at least two). */
  answers: number[]
}

export type InputQuestion = QuestionBase & {
  kind: 'input'
  /** Every accepted form of the answer: "10", "10 см", "на 10". */
  answers: string[]
}

export type QuizQuestion = SingleQuestion | MultipleQuestion | InputQuestion

export type ControlTask = {
  topic: number
  /** Task text, plain text. */
  text: string
  points: number
  /** Every accepted form of the final answer. */
  answers: string[]
  /** Trusted HTML with the worked solution. */
  solution: string
}

/** Full content of one grade of a subject, loaded lazily. */
export type Grade = {
  /** `${subjectId}-${grade}`, matches the file name. */
  id: string
  subjectId: string
  grade: GradeNumber
  /** Grade in the Soviet numbering when it differs from `grade` (before the 1986 reform). */
  ussrGrade?: number
  /** Textbook the grade follows, e.g. "М. И. Моро и др. «Математика. 1 класс»". */
  textbook: string
  topics: Topic[]
  quiz: QuizQuestion[]
  control: ControlTask[]
}

/** Lightweight grade info for lists and progress. Generated into `grades-index.json`. */
export type GradeSummary = {
  id: string
  subjectId: string
  grade: GradeNumber
  ussrGrade?: number
  textbook: string
  topicTitles: string[]
  quizCount: number
  controlCount: number
  controlPoints: number
}
