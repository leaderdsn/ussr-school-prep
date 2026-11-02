import { describe, expect, it } from 'vitest'

import gradesIndex from '../data/grades-index.json'
import subjects from '../data/subjects.json'

import { checkHtml, countWords, summarizeGrade, validateGrade, validateSubjects } from './validate'

import type { Grade, Subject } from '../model/types'

const gradeFiles = import.meta.glob<Grade>('../data/grades/*.json', { eager: true, import: 'default' })
const SUBJECTS = subjects as Subject[]

function fileName(path: string): string {
  return path.split('/').pop()!.replace('.json', '')
}

describe('содержимое data/', () => {
  it('subjects.json валиден', () => {
    expect(validateSubjects(subjects)).toEqual([])
  })

  it.each(Object.entries(gradeFiles).map(([path, grade]) => [fileName(path), grade] as const))(
    '%s.json валиден',
    (name, grade) => {
      expect(validateGrade(grade, SUBJECTS, name)).toEqual([])
    },
  )

  it('grades-index.json соответствует файлам классов', () => {
    const summaries = Object.values(gradeFiles).map(summarizeGrade)
    expect(gradesIndex).toEqual(expect.arrayContaining(summaries))
    expect(gradesIndex).toHaveLength(summaries.length)
  })
})

describe('checkHtml', () => {
  it('пропускает разрешённую разметку', () => {
    const html = '<p class="rule">Правило</p><div class="table-wrap"><table><tr><td colspan="2">1</td></tr></table></div>'
    expect(checkHtml(html, 'x')).toEqual([])
  })

  it.each([
    ['<script>alert(1)</script>', 'тег <script>'],
    ['<p onclick="x()">a</p>', 'атрибут «onclick»'],
    ['<p style="color:red">a</p>', 'атрибут «style»'],
    ['<p class="rule fancy">a</p>', 'класс «fancy»'],
    ['<img src="a.png">', 'тег <img>'],
    ['<b>javascript:void(0)</b>', 'javascript:'],
  ])('ловит %s', (html, message) => {
    expect(checkHtml(html, 'x').join(' ')).toContain(message)
  })
})

describe('countWords', () => {
  it('считает слова видимого текста без тегов, тире и сущностей', () => {
    expect(countWords('<p>Один <b>два</b> три — 4 &gt; 3</p>')).toBe(5)
  })
})

describe('validateGrade', () => {
  const base = gradeFiles['../data/grades/math-1.json']!

  it('сообщает о неверном id, классе без описания и пробелах в тесте', () => {
    const broken = {
      ...base,
      id: 'math-2',
      quiz: base.quiz.filter((question) => question.kind !== 'multiple').slice(0, 5),
      control: base.control.slice(0, 2),
    }
    const issues = validateGrade(broken, SUBJECTS, 'math-1').join('\n')

    expect(issues).toContain('id: ожидается «math-1»')
    expect(issues).toContain('quiz: нужно 10–12 вопросов')
    expect(issues).toContain('нет ни одного вопроса вида "multiple"')
    expect(issues).toContain('control: нужно 5–7 заданий')
  })

  it('требует gradeDescriptions для нового класса и ссылки вопросов на существующие темы', () => {
    const issues = validateGrade(
      { ...base, id: 'math-2', grade: 2, quiz: [{ ...base.quiz[0]!, topic: 99 }, ...base.quiz.slice(1)] },
      SUBJECTS,
    ).join('\n')

    expect(issues).toContain('gradeDescriptions["2"]')
    expect(issues).toContain('quiz[0].topic')
  })
})
