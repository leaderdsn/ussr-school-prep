import { describe, expect, it } from 'vitest'

import { withContentBase } from './contentHtml'

describe('withContentBase', () => {
  it('добавляет базовый путь сайта к картинкам урока', () => {
    const html = '<figure><img src="/content-images/lynx.jpg" alt="Рысь"></figure>'
    expect(withContentBase(html, '/ussr-school-prep/')).toBe(
      '<figure><img src="/ussr-school-prep/content-images/lynx.jpg" alt="Рысь"></figure>',
    )
    expect(withContentBase(html, '/')).toBe(html)
  })

  it('не трогает остальной текст', () => {
    expect(withContentBase('<p>/content-images/ в тексте</p>', '/x/')).toBe('<p>/content-images/ в тексте</p>')
  })
})
