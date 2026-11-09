import { describe, expect, it } from 'vitest'

import gradesIndex from '../data/grades-index.json'
import subjects from '../data/subjects.json'

import { checkHtml, contentImages, countWords, summarizeGrade, validateGrade, validateSubjects } from './validate'

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
    ['<img src="a.png">', 'только у <img>'],
    ['<b>javascript:void(0)</b>', 'javascript:'],
  ])('ловит %s', (html, message) => {
    expect(checkHtml(html, 'x').join(' ')).toContain(message)
  })
})

describe('checkHtml: рисунки', () => {
  const svg = (inner: string, attrs = 'viewBox="0 0 100 50" role="img" aria-label="Отрезок AB"') =>
    `<figure><svg ${attrs}>${inner}</svg><figcaption>Рис. 1</figcaption></figure>`

  it('пропускает чертёж, раскрашенный классами', () => {
    const html = svg(
      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>' +
        '<line x1="10" y1="25" x2="90" y2="25" class="accent" stroke="currentColor" marker-end="url(#arrow)"/>' +
        '<text x="10" y="45" text-anchor="middle">A</text>',
    )
    expect(checkHtml(html, 'x')).toEqual([])
  })

  it('разбирает имена атрибутов с цифрами и отрицательные значения', () => {
    expect(checkHtml(svg('<line x1="-20" y1="5" x2="-3.5" y2="40" stroke="currentColor"/>'), 'x')).toEqual([])
  })

  it.each([
    [svg('<line stroke="#ff0000"/>'), 'цвет задавайте классом'],
    [svg('<line/>', 'role="img" aria-label="A"'), 'нужен viewBox'],
    [svg('<line/>', 'viewBox="0 0 1 1"'), 'нужен aria-label'],
    [svg('<path d="M0 0" marker-end="url(http://x)"/>'), 'ссылка на маркер'],
    [svg('<image href="a.png"/>'), 'тег <image>'],
    [svg('<line onclick="x()"/>'), 'атрибут «onclick»'],
    [svg('<line onclick=x()/>'), 'атрибут «onclick»'],
    [svg("<line stroke='#f00'/>"), 'цвет задавайте классом'],
  ])('ловит ошибку в рисунке %#', (html, message) => {
    expect(checkHtml(html, 'x').join(' ')).toContain(message)
  })
})

describe('checkHtml: картинки и фото', () => {
  it('пропускает картинку проекта с описанием', () => {
    const html = '<figure><img src="/content-images/lynx.jpg" alt="Рысь на снегу" loading="lazy"><figcaption>Рис. 1</figcaption></figure>'
    expect(checkHtml(html, 'x')).toEqual([])
  })

  it.each([
    ['<img src="https://example.com/a.jpg" alt="a">', 'только у <img> и только файл из /content-images/'],
    ['<img src="/content-images/../secret.jpg" alt="a">', 'только у <img>'],
    ['<img src="/content-images/a.gif" alt="a">', 'только у <img>'],
    ['<img src="/content-images/a.jpg">', 'нужен alt'],
    ['<img alt="a">', 'нужен src'],
    ['<p src="/content-images/a.jpg">a</p>', 'только у <img>'],
  ])('ловит %s', (html, message) => {
    expect(checkHtml(html, 'x').join(' ')).toContain(message)
  })

  it('находит картинки урока', () => {
    expect(contentImages('<img src="/content-images/a.jpg" alt="a"><p>x</p><img alt="b" src="/content-images/b.png">')).toEqual([
      '/content-images/a.jpg',
      '/content-images/b.png',
    ])
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

  it('требует не меньше трёх заданий в тетрадь у каждой темы', () => {
    const topics = base.topics.map((topic, index) =>
      index === 0 ? { ...topic, exercises: topic.exercises.slice(0, 2) } : topic,
    )
    const issues = validateGrade({ ...base, topics }, SUBJECTS, 'math-1').join('\n')

    expect(issues).toContain('topics[0].exercises: нужно 3–10 заданий в тетрадь, сейчас 2')
  })

  it('требует gradeDescriptions для нового класса и ссылки вопросов на существующие темы', () => {
    // A catalog where math has no description for grade 2, whatever the real subjects.json says.
    const subjects = SUBJECTS.map((subject) => (subject.id === 'math' ? { ...subject, gradeDescriptions: {} } : subject))
    const issues = validateGrade(
      { ...base, id: 'math-2', grade: 2, quiz: [{ ...base.quiz[0]!, topic: 99 }, ...base.quiz.slice(1)] },
      subjects,
    ).join('\n')

    expect(issues).toContain('gradeDescriptions["2"]')
    expect(issues).toContain('quiz[0].topic')
  })
})
