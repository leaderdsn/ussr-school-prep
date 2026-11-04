/** Text length of one book page (about 300 words). */
export const PAGE_CHARS = 2400

/** Texts shorter than this stay on one page: pagination is only for long reading. */
export const PAGINATE_FROM = PAGE_CHARS * 1.5

const KEEP_WITH_NEXT = new Set(['H3', 'H4'])

function keepsWithNext(element: Element): boolean {
  return KEEP_WITH_NEXT.has(element.tagName) || element.classList.contains('source')
}

/**
 * Splits trusted lesson HTML into book pages at the boundaries of top-level blocks.
 * A heading and the source note under it never end a page alone.
 */
export function paginateHtml(html: string, pageChars = PAGE_CHARS): string[] {
  const template = document.createElement('template')
  template.innerHTML = html
  const blocks = Array.from(template.content.children)
  const total = blocks.reduce((sum, block) => sum + (block.textContent?.length ?? 0), 0)
  if (total < pageChars * 1.5) return [html]

  const pages: string[] = []
  let current = ''
  let size = 0
  for (const block of blocks) {
    const length = block.textContent?.length ?? 0
    const overflow = size > 0 && size + length > pageChars
    const lonelyHeading = size > pageChars * 0.6 && keepsWithNext(block)
    if (overflow || lonelyHeading) {
      pages.push(current)
      current = ''
      size = 0
    }
    current += block.outerHTML
    size += length
  }
  if (current) pages.push(current)
  return pages
}
