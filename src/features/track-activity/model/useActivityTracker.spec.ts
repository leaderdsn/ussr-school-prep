import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import { dayKey, useProgressStore } from '@/entities/progress'

import { IDLE_MS, TICK_MS } from '../config/activity'

import { useActivityTracker } from './useActivityTracker'

describe('useActivityTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('считает время, пока ребёнок активен, и перестаёт при простое', () => {
    const scope = effectScope()
    scope.run(() => useActivityTracker())
    const progress = useProgressStore()

    vi.advanceTimersByTime(TICK_MS * 4)
    expect(progress.current.activity[dayKey()]).toBe((TICK_MS / 1000) * 4)

    vi.advanceTimersByTime(IDLE_MS * 2)
    const afterIdle = progress.current.activity[dayKey()]
    vi.advanceTimersByTime(TICK_MS * 4)
    expect(progress.current.activity[dayKey()]).toBe(afterIdle)

    window.dispatchEvent(new Event('keydown'))
    vi.advanceTimersByTime(TICK_MS)
    expect(progress.current.activity[dayKey()]).toBe(afterIdle! + TICK_MS / 1000)

    scope.stop()
  })
})
