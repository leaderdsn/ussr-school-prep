import { describe, expect, it } from 'vitest'

import { subjectTheme, subjectThemeVars } from './themes'

import type { PaperPattern } from './themes'

describe('subjectTheme', () => {
  it('берёт оформление предмета поверх оформления эпохи', () => {
    expect(subjectTheme({ id: 'physics', era: 'ussr' })).toMatchObject({ pattern: 'millimeter', icon: 'pi pi-bolt' })
    expect(subjectTheme({ id: 'world-around', era: 'rf' })).toMatchObject({ pattern: 'plain', icon: 'pi pi-globe' })
  })

  it('даёт оформление по умолчанию для предмета без своей темы', () => {
    expect(subjectTheme({ id: 'new-subject', era: 'ussr' }).pattern).toBe('squared')
    expect(subjectTheme({ id: 'new-subject', era: 'rf' }).pattern).toBe('plain')
  })
})

describe('subjectThemeVars', () => {
  it('задаёт акцент для светлой и тёмной темы и лист урока', () => {
    const vars = subjectThemeVars(subjectTheme({ id: 'math', era: 'ussr' }))

    expect(vars['--app-link']).toBe('light-dark(#b3261e, #ff8a80)')
    expect(vars['--app-paper-image']).toContain('linear-gradient')
    expect(vars['--app-grid-line']).toBeUndefined()
  })

  it('красит линии миллиметровки в цвет предмета, а современный лист оставляет чистым', () => {
    expect(subjectThemeVars(subjectTheme({ id: 'physics', era: 'ussr' }))['--app-grid-line']).toContain('#a14a12')
    expect(subjectThemeVars(subjectTheme({ id: 'world-around', era: 'rf' }))['--app-paper-image']).toBe('none')
  })
})

describe('бумага урока', () => {
  const patterns: PaperPattern[] = ['squared', 'ruled', 'millimeter', 'stars', 'plain']

  it.each(patterns)('%s: у каждого слоя фона свой размер', (pattern) => {
    const vars = subjectThemeVars({ accent: { light: '#000', dark: '#fff' }, pattern, icon: '' })
    const layers = vars['--app-paper-image']!.match(/gradient\(/g)?.length ?? 1
    const sizes = vars['--app-paper-size']!.split(', ').length

    expect(sizes).toBe(layers)
  })
})
