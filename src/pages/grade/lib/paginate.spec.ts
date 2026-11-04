import { describe, expect, it } from 'vitest'

import { paginateHtml } from './paginate'

const p = (length: number) => `<p>${'а'.repeat(length)}</p>`

describe('paginateHtml', () => {
  it('оставляет короткий текст одной страницей', () => {
    const html = `${p(100)}${p(100)}`
    expect(paginateHtml(html, 1000)).toEqual([html])
  })

  it('режет длинный текст по блокам и ничего не теряет', () => {
    const html = Array.from({ length: 10 }, () => p(400)).join('')
    const pages = paginateHtml(html, 1000)

    expect(pages.length).toBeGreaterThan(2)
    expect(pages.join('')).toBe(html)
    expect(pages.every((page) => (page.match(/<p>/g) ?? []).length <= 2)).toBe(true)
  })

  it('не оставляет заголовок и пометку об источнике в конце страницы', () => {
    const html = `${p(700)}<h3>Название</h3><p class="source">Источник</p>${p(500)}${p(900)}${p(900)}`
    const pages = paginateHtml(html, 1000)

    expect(pages[0]).toBe(p(700))
    expect(pages[1]!.startsWith('<h3>Название</h3><p class="source">')).toBe(true)
  })
})
