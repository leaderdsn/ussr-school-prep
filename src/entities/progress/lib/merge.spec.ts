import { describe, expect, it } from 'vitest'

import { isSameData, mergeFamily } from './merge'
import { createEmptyChildProgress, parseFamily } from './parse'

import type { AttemptRecord, ChildRecord } from '../model/types'

const empty = { bestScore: null, lastScore: null, attempts: 0, passedAt: null }

function child(id: string, name: string, patch: Partial<ChildRecord['progress']> = {}): ChildRecord {
  return {
    profile: { id, name, createdAt: '2026-01-01T00:00:00.000Z' },
    progress: { ...createEmptyChildProgress(), ...patch },
  }
}

function attempt(id: string, at: string): AttemptRecord {
  return { id, gradeId: 'math-1', kind: 'test', at, percent: 70, durationSec: 30, mistakes: [] }
}

describe('mergeFamily', () => {
  it('объединяет детей и ничего не теряет', () => {
    const local = {
      a: child('a', 'Маша', {
        grades: { 'math-1': { seenTopics: [0], test: { ...empty, bestScore: 60, attempts: 1 }, control: empty } },
        history: [attempt('x', '2026-01-02T00:00:00.000Z')],
        activity: { '2026-01-02': 300 },
      }),
      b: child('b', 'Петя'),
    }
    const remote = {
      a: child('a', 'Мария', {
        grades: { 'math-1': { seenTopics: [2], test: { ...empty, bestScore: 90, attempts: 2 }, control: empty } },
        history: [attempt('y', '2026-01-01T00:00:00.000Z')],
        activity: { '2026-01-02': 120, '2026-01-01': 60 },
      }),
      c: child('c', 'Ваня'),
    }

    const merged = mergeFamily(local, remote)

    expect(Object.keys(merged).sort()).toEqual(['a', 'b', 'c'])
    expect(merged.a!.profile.name).toBe('Мария')
    expect(merged.a!.progress.grades['math-1']).toMatchObject({ seenTopics: [0, 2], test: { bestScore: 90, attempts: 2 } })
    expect(merged.a!.progress.history.map((item) => item.id)).toEqual(['y', 'x'])
    expect(merged.a!.progress.activity).toEqual({ '2026-01-02': 300, '2026-01-01': 60 })
  })
})

describe('parseFamily', () => {
  it('восстанавливает пустые поля, которые Firebase не хранит', () => {
    const family = parseFamily({
      a: {
        profile: { name: 'Маша', createdAt: '2026-01-01T00:00:00.000Z' },
        progress: {
          grades: { 'math-1': { test: { attempts: 1, bestScore: 80, lastScore: 80 } } },
          history: { 0: { id: 'x', gradeId: 'math-1', kind: 'test', at: '2026-01-02T00:00:00.000Z', percent: 80, durationSec: 5 } },
        },
      },
      broken: { profile: { name: '' } },
    })

    expect(Object.keys(family)).toEqual(['a'])
    expect(family.a!.progress.grades['math-1']).toEqual({
      seenTopics: [],
      test: { bestScore: 80, lastScore: 80, attempts: 1, passedAt: null },
      control: empty,
    })
    expect(family.a!.progress.history[0]!.mistakes).toEqual([])
    expect(family.a!.progress.lastVisited).toBeNull()
  })

  it('сравнивает данные без учёта порядка ключей', () => {
    expect(isSameData({ a: 1, b: [1, { c: 2, d: 3 }] }, { b: [1, { d: 3, c: 2 }], a: 1 })).toBe(true)
    expect(isSameData({ a: 1 }, { a: 2 })).toBe(false)
  })
})
