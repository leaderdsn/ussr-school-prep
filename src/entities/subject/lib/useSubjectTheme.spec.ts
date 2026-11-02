import { describe, expect, it } from 'vitest'
import { effectScope, ref } from 'vue'

import { useSubjectTheme } from './useSubjectTheme'

describe('useSubjectTheme', () => {
  it('переодевает приложение в стиль предмета и снимает стиль при выходе', async () => {
    const root = document.documentElement
    const subject = ref<{ id: string; era: 'ussr' | 'rf' } | null>({ id: 'math', era: 'ussr' })
    const scope = effectScope()
    scope.run(() => useSubjectTheme(subject))

    expect(root.dataset.era).toBe('ussr')
    expect(root.style.getPropertyValue('--app-paper-size')).toBe('1.25rem 1.25rem, 1.25rem 1.25rem')

    subject.value = { id: 'world-around', era: 'rf' }
    await Promise.resolve()
    expect(root.dataset.era).toBe('rf')
    expect(root.dataset.subject).toBe('world-around')

    scope.stop()
    expect(root.dataset.era).toBeUndefined()
    expect(root.style.getPropertyValue('--app-paper-size')).toBe('')
  })
})
