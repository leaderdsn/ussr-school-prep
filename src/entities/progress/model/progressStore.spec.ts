import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { DEFAULT_CHILD_NAME, PROGRESS_STORAGE_KEY } from '../config/storage'
import { dayKey } from '../lib/day'
import { schoolMark } from '../lib/mark'

import { useProgressStore } from './progressStore'

import type { NewAttempt } from './progressStore'

const empty = { bestScore: null, lastScore: null, attempts: 0, passedAt: null }

function attempt(overrides: Partial<NewAttempt> = {}): NewAttempt {
  return { gradeId: 'math-1', kind: 'test', percent: 50, durationSec: 60, mistakes: [], ...overrides }
}

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('профили', () => {
    it('при первом запуске создаёт профиль по умолчанию и делает его активным', () => {
      const store = useProgressStore()

      expect(store.children).toHaveLength(1)
      expect(store.activeChild.name).toBe(DEFAULT_CHILD_NAME)
      expect(store.getGrade('math-1')).toEqual({ seenTopics: [], test: empty, control: empty })
    })

    it('ведёт прогресс каждого ребёнка отдельно', () => {
      const store = useProgressStore()
      const first = store.activeChildId!
      const second = store.addChild('Маша')

      store.markTopicSeen('math-1', 0)
      store.selectChild(second)
      store.markTopicSeen('math-1', 3)

      expect(store.getGrade('math-1').seenTopics).toEqual([3])
      expect(store.progressOf(first).grades['math-1']?.seenTopics).toEqual([0])
    })

    it('переименовывает, удаляет и не даёт удалить последний профиль', () => {
      const store = useProgressStore()
      const first = store.activeChildId!
      const second = store.addChild('  Петя ')
      store.renameChild(second, 'Пётр')
      expect(store.children.map((child) => child.name)).toEqual([DEFAULT_CHILD_NAME, 'Пётр'])

      store.selectChild(second)
      expect(store.removeChild(second)).toBe(true)
      expect(store.activeChildId).toBe(first)
      expect(store.removeChild(first)).toBe(false)
    })
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
  ])('учитывает результаты $kind $results и пишет историю', ({ kind, results, best, last, passed }) => {
    const store = useProgressStore()

    results.forEach((percent) => store.recordAttempt(attempt({ kind, percent })))
    const result = store.getGrade('math-1')[kind]

    expect(result).toMatchObject({ attempts: results.length, bestScore: best, lastScore: last })
    expect(result.passedAt !== null).toBe(passed)
    expect(store.current.history.map((item) => item.percent)).toEqual(results)
  })

  it('хранит ошибки и время попытки', () => {
    const store = useProgressStore()
    const mistakes = [{ index: 2, topic: 1, given: '7' }]

    const record = store.recordAttempt(attempt({ durationSec: 95, mistakes }))

    expect(record).toMatchObject({ durationSec: 95, mistakes })
    expect(record.id).toMatch(/^a_/)
    expect(Date.parse(record.at)).not.toBeNaN()
  })

  it('суммирует время занятий по дням', () => {
    const store = useProgressStore()
    const day = new Date(2026, 10, 2, 18)

    store.addActivity(15, day)
    store.addActivity(15, day)
    store.addActivity(0, day)

    expect(store.current.activity).toEqual({ [dayKey(day)]: 30 })
  })

  it('сохраняет семью в localStorage и восстанавливает её с выбранным профилем', async () => {
    const store = useProgressStore()
    const id = store.addChild('Маша')
    store.selectChild(id)
    store.markTopicSeen('math-1', 1)
    store.setLastVisited({ gradeId: 'math-1', step: 2 })
    await nextTick()

    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)!).version).toBe(2)

    setActivePinia(createPinia())
    const restored = useProgressStore()

    expect(restored.activeChild.name).toBe('Маша')
    expect(restored.getGrade('math-1').seenTopics).toEqual([1])
    expect(restored.lastVisited).toEqual({ gradeId: 'math-1', step: 2 })
  })

  it('переносит прогресс версии 1 в профиль по умолчанию', () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        grades: { 'math-1': { seenTopics: [0, 2], test: { ...empty, bestScore: 90, attempts: 1 }, control: empty } },
        lastVisited: { gradeId: 'math-1', step: 'test' },
      }),
    )

    const store = useProgressStore()

    expect(store.children).toHaveLength(1)
    expect(store.getGrade('math-1').test.bestScore).toBe(90)
    expect(store.lastVisited).toEqual({ gradeId: 'math-1', step: 'test' })
  })

  it.each(['{не json', '42', JSON.stringify({ version: 9, children: {} })])('не падает на мусоре в хранилище: %s', (raw) => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, raw)

    const store = useProgressStore()
    expect(store.children).toHaveLength(1)
    expect(store.grades).toEqual({})
  })

  it('сбрасывает прогресс всех детей, сохраняя профили', () => {
    const store = useProgressStore()
    store.markTopicSeen('math-1', 0)
    store.selectChild(store.addChild('Маша'))
    store.recordAttempt(attempt())

    store.resetAll()

    expect(store.children).toHaveLength(2)
    expect(Object.values(store.family).every((record) => record.progress.history.length === 0)).toBe(true)
  })

  describe('экспорт и импорт', () => {
    it('переносит всех детей через JSON', () => {
      const source = useProgressStore()
      source.selectChild(source.addChild('Маша'))
      source.recordAttempt(attempt({ kind: 'control', percent: 90 }))
      const json = source.exportJson()

      setActivePinia(createPinia())
      localStorage.clear()
      const target = useProgressStore()
      target.importJson(json)

      const masha = target.children.find((child) => child.name === 'Маша')!
      expect(target.children).toHaveLength(2)
      expect(target.progressOf(masha.id).grades['math-1']?.control.bestScore).toBe(90)
    })

    it.each([
      ['не JSON', 'abc'],
      ['не тот объект', '[]'],
      ['другая версия', JSON.stringify({ version: 9, children: {} })],
      ['нет профилей', JSON.stringify({ version: 2, children: {} })],
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
