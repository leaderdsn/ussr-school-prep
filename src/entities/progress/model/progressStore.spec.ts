import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { PROGRESS_STORAGE_KEY } from '../config/storage'
import { schoolMark } from '../lib/mark'

import { useProgressStore } from './progressStore'

const attempts = { bestScore: 90, lastScore: 70, attempts: 2, passedAt: '2026-01-01T00:00:00.000Z' }
const empty = { bestScore: null, lastScore: null, attempts: 0, passedAt: null }
const validGrade = { seenTopics: [0, 2], test: attempts, control: empty }

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('возвращает пустой прогресс, не создавая запись', () => {
    const store = useProgressStore()

    expect(store.getGrade('math-1')).toEqual({ seenTopics: [], test: empty, control: empty })
    expect(store.grades).toEqual({})
  })

  it('отмечает темы как просмотренные без дублей и по порядку', () => {
    const store = useProgressStore()

    store.markTopicSeen('math-1', 3)
    store.markTopicSeen('math-1', 1)
    store.markTopicSeen('math-1', 3)

    expect(store.getGrade('math-1').seenTopics).toEqual([1, 3])
  })

  it.each([
    { kind: 'test' as const, results: [60, 40], best: 60, last: 40, passed: false },
    { kind: 'test' as const, results: [80], best: 80, last: 80, passed: true },
    { kind: 'control' as const, results: [40], best: 40, last: 40, passed: false },
    { kind: 'control' as const, results: [50, 20], best: 50, last: 20, passed: true },
  ])('учитывает результаты $kind $results', ({ kind, results, best, last, passed }) => {
    const store = useProgressStore()

    results.forEach((percent) => store.recordResult('math-1', kind, percent))
    const result = store.getGrade('math-1')[kind]

    expect(result.attempts).toBe(results.length)
    expect(result.bestScore).toBe(best)
    expect(result.lastScore).toBe(last)
    expect(result.passedAt !== null).toBe(passed)
  })

  it('ведёт тест и контрольную раздельно и фиксирует дату первого зачёта один раз', () => {
    const store = useProgressStore()

    store.recordResult('math-1', 'test', 85)
    const first = store.getGrade('math-1').test.passedAt
    store.recordResult('math-1', 'test', 95)

    expect(store.getGrade('math-1').test.passedAt).toBe(first)
    expect(store.getGrade('math-1').control).toEqual(empty)
  })

  it('сбрасывает класс и всё сразу', () => {
    const store = useProgressStore()
    store.markTopicSeen('a', 0)
    store.markTopicSeen('b', 0)
    store.setLastVisited({ gradeId: 'a', step: 'test' })

    store.resetGrade('a')
    expect(Object.keys(store.grades)).toEqual(['b'])
    expect(store.lastVisited).toBeNull()

    store.resetAll()
    expect(store.grades).toEqual({})
  })

  it('сохраняет состояние в localStorage и восстанавливает его', async () => {
    const store = useProgressStore()
    store.markTopicSeen('math-1', 1)
    store.setLastVisited({ gradeId: 'math-1', step: 2 })
    await nextTick()

    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)!).version).toBe(1)

    setActivePinia(createPinia())
    const restored = useProgressStore()

    expect(restored.getGrade('math-1').seenTopics).toEqual([1])
    expect(restored.lastVisited).toEqual({ gradeId: 'math-1', step: 2 })
  })

  it('отбрасывает повреждённые записи при чтении', () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        grades: {
          good: validGrade,
          bad: { seenTopics: 'x' },
          worse: 5,
          range: { ...validGrade, test: { ...attempts, bestScore: 150 } },
          noControl: { seenTopics: [], test: empty },
        },
        lastVisited: { gradeId: 'good', step: 0 },
      }),
    )

    const store = useProgressStore()

    expect(Object.keys(store.grades)).toEqual(['good'])
    expect(store.lastVisited).toBeNull()
  })

  it.each(['{не json', '42', JSON.stringify({ version: 2, grades: {} })])('не падает на мусоре в хранилище: %s', (raw) => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, raw)

    expect(useProgressStore().grades).toEqual({})
  })

  describe('экспорт и импорт', () => {
    it('переносит состояние через JSON', () => {
      const source = useProgressStore()
      source.recordResult('math-1', 'control', 90)
      source.setLastVisited({ gradeId: 'math-1', step: 'control' })
      const json = source.exportJson()

      setActivePinia(createPinia())
      localStorage.clear()
      const target = useProgressStore()
      target.importJson(json)

      expect(target.getGrade('math-1').control.bestScore).toBe(90)
      expect(target.lastVisited).toEqual({ gradeId: 'math-1', step: 'control' })
    })

    it.each([
      ['не JSON', 'abc'],
      ['не тот объект', '[]'],
      ['другая версия', JSON.stringify({ version: 9, grades: {} })],
      ['нет grades', JSON.stringify({ version: 1 })],
      ['битый класс', JSON.stringify({ version: 1, grades: { a: { seenTopics: [], test: { attempts: -1 } } } })],
    ])('бросает ошибку: %s', (_name, json) => {
      const store = useProgressStore()
      store.markTopicSeen('keep', 0)

      expect(() => store.importJson(json)).toThrow(/[А-Яа-я]/)
      expect(Object.keys(store.grades)).toEqual(['keep'])
    })
  })
})

describe('schoolMark', () => {
  it.each([
    [100, 5],
    [90, 5],
    [89, 4],
    [70, 4],
    [50, 3],
    [49, 2],
    [0, 2],
  ])('%i%% → %i', (percent, mark) => {
    expect(schoolMark(percent)).toBe(mark)
  })
})
