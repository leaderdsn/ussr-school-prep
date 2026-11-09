/**
 * Content tooling, runs under plain Node (type stripping):
 *   pnpm content:status — what is written and what is next in the queue
 *   pnpm content:index  — regenerate grades-index.json from grades/*.json
 *   pnpm content:check  — validate subjects.json, every grade file and the index
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { contentImages, summarizeGrade, validateGrade, validateSubjects } from '../src/entities/subject/lib/validate.ts'

import type { Grade, GradeSummary, Subject } from '../src/entities/subject/model/types.ts'

const DATA_DIR = join(import.meta.dirname, '../src/entities/subject/data')
const GRADES_DIR = join(DATA_DIR, 'grades')
const SUBJECTS_FILE = join(DATA_DIR, 'subjects.json')
const INDEX_FILE = join(DATA_DIR, 'grades-index.json')
const PUBLIC_DIR = join(import.meta.dirname, '../public')

/** Work order: these groups first (by grade inside a group), then everything else in catalog order. */
const QUEUE_GROUPS: readonly (readonly string[])[] = [
  ['math', 'algebra', 'geometry'],
  ['russian'],
  ['reading'],
  ['physics'],
  ['chemistry'],
  ['literature'],
]

function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, 'utf-8'))
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function gradeFiles(): string[] {
  return readdirSync(GRADES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -'.json'.length))
}

function loadSubjects(): Subject[] {
  return readJson(SUBJECTS_FILE) as Subject[]
}

function buildIndex(subjects: readonly Subject[]): GradeSummary[] {
  const order = new Map(subjects.map((subject, index) => [subject.id, index]))
  return gradeFiles()
    .map((name) => summarizeGrade(readJson(join(GRADES_DIR, `${name}.json`)) as Grade))
    .sort((a, b) => (order.get(a.subjectId) ?? 99) - (order.get(b.subjectId) ?? 99) || a.grade - b.grade)
}

function queue(subjects: readonly Subject[]): string[] {
  const grouped = new Set(QUEUE_GROUPS.flat())
  const groups = [...QUEUE_GROUPS, ...subjects.filter((s) => !grouped.has(s.id)).map((s) => [s.id])]
  return groups.flatMap((group) => {
    const members = subjects.filter((subject) => group.includes(subject.id))
    return [...new Set(members.flatMap((subject) => subject.grades))]
      .sort((a, b) => a - b)
      .flatMap((grade) =>
        members.filter((subject) => subject.grades.includes(grade)).map((subject) => `${subject.id}-${grade}`),
      )
  })
}

function status() {
  const subjects = loadSubjects()
  const done = new Set(gradeFiles())

  for (const subject of subjects) {
    const marks = subject.grades.map((grade) => (done.has(`${subject.id}-${grade}`) ? `[${grade}]` : ` ${grade} `))
    console.log(`${subject.id.padEnd(16)} ${subject.era.padEnd(5)} ${marks.join('')}`)
  }

  const pending = queue(subjects).filter((id) => !done.has(id))
  const total = subjects.reduce((sum, subject) => sum + subject.grades.length, 0)
  console.log(`\nГотово: ${total - pending.length} из ${total} ([N] — класс написан)`)
  console.log(pending.length ? `Дальше по очереди: ${pending.slice(0, 5).join(', ')}` : 'Очередь пуста')
}

function index() {
  const summaries = buildIndex(loadSubjects())
  writeFileSync(INDEX_FILE, toJson(summaries))
  console.log(`grades-index.json обновлён, классов в индексе: ${summaries.length}`)
}

function check(): boolean {
  const problems: string[] = []
  const subjectsData = readJson(SUBJECTS_FILE)
  problems.push(...validateSubjects(subjectsData).map((issue) => `subjects.json: ${issue}`))
  const subjects = subjectsData as Subject[]

  const names = gradeFiles()
  for (const name of names) {
    let data: unknown
    try {
      data = readJson(join(GRADES_DIR, `${name}.json`))
    } catch (error) {
      problems.push(`${name}.json: не JSON (${(error as Error).message})`)
      continue
    }
    problems.push(...validateGrade(data, subjects, name).map((issue) => `${name}.json: ${issue}`))
    // Every picture the lesson refers to must be a file of the project
    for (const src of new Set(contentImages(JSON.stringify(data).replaceAll('\\"', '"')))) {
      if (!existsSync(join(PUBLIC_DIR, src))) problems.push(`${name}.json: нет файла картинки public${src}`)
    }
  }

  if (problems.length === 0) {
    const current = readFileSync(INDEX_FILE, 'utf-8')
    if (current !== toJson(buildIndex(subjects))) problems.push('grades-index.json устарел: запустите pnpm content:index')
  }

  for (const problem of problems) console.error(`✗ ${problem}`)
  console.log(problems.length ? `\nОшибок: ${problems.length}` : `✓ subjects.json и файлы классов (${names.length}) в порядке`)
  return problems.length === 0
}

const command = process.argv[2]
if (command === 'status') status()
else if (command === 'index') index()
else if (command === 'check') process.exitCode = check() ? 0 : 1
else {
  console.error('Использование: node scripts/content.ts <status|index|check>')
  process.exitCode = 1
}
