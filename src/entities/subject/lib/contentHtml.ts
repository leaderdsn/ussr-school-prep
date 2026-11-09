/**
 * Lesson HTML refers to pictures as "/content-images/<file>" (files of public/content-images).
 * The site may live under a base path (GitHub Pages: /ussr-school-prep/), so the path is prefixed with it.
 */
export function withContentBase(html: string, base: string = import.meta.env.BASE_URL): string {
  const prefix = base.endsWith('/') ? base : `${base}/`
  return html.split('src="/content-images/').join(`src="${prefix}content-images/`)
}
