/**
 * Downloads a freely licensed picture from Wikimedia Commons into public/content-images and prints
 * the <figure> to paste into a lesson, with the author and the licence in the caption.
 *
 *   pnpm content:image "File:Lynx lynx poing.jpg" lynx            — saves public/content-images/lynx.jpg
 *   pnpm content:image "File:Lynx lynx poing.jpg" lynx 1200       — wider copy (default 900 px)
 *
 * Only pictures in the public domain or under CC0 / CC BY / CC BY-SA are accepted.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT_DIR = join(import.meta.dirname, '../public/content-images')
const API = 'https://commons.wikimedia.org/w/api.php'
const HEADERS = { 'User-Agent': 'ussr-school-prep/1.0 (educational project; https://github.com/leaderdsn/ussr-school-prep)' }
const FREE_LICENSE = /^(public domain|pd|cc0|cc[- ]by(?:[- ]sa)?(?:[- ][\d.]+)?)/i
const NAME = /^[a-z0-9][a-z0-9-]*$/

type Meta = Record<string, { value: string } | undefined>
type ImageInfo = { thumburl: string; descriptionurl: string; extmetadata: Meta }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const plain = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Commons limits automated clients: retry with a growing pause instead of failing on the first refusal. */
async function fetchWithRetry(url: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, { headers: HEADERS })
    if (response.ok && !response.headers.get('content-type')?.includes('text/html')) return response
    if (attempt === 5) throw new Error(`Commons не отвечает: ${response.status} ${url}`)
    await sleep(5000 * attempt)
  }
}

async function main() {
  const [rawTitle, name, widthArg] = process.argv.slice(2)
  if (!rawTitle || !name || !NAME.test(name)) {
    console.error('Использование: pnpm content:image "File:Название.jpg" имя-латиницей [ширина]')
    process.exitCode = 1
    return
  }
  const title = rawTitle.startsWith('File:') ? rawTitle : `File:${rawTitle}`
  const width = Number(widthArg ?? 900)

  const query = `${API}?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${width}&titles=${encodeURIComponent(title)}`
  const data = (await (await fetchWithRetry(query)).json()) as { query: { pages: Record<string, { missing?: string; imageinfo?: ImageInfo[] }> } }
  const page = Object.values(data.query.pages)[0]
  const info = page?.imageinfo?.[0]
  if (!info) throw new Error(`На Commons нет файла «${title}»`)

  const license = plain(info.extmetadata.LicenseShortName?.value)
  if (!FREE_LICENSE.test(license)) throw new Error(`Лицензия «${license}» не подходит: нужны public domain, CC0, CC BY или CC BY-SA`)
  const author = plain(info.extmetadata.Artist?.value) || 'автор не указан'
  const description = plain(info.extmetadata.ImageDescription?.value)

  const extension = (info.thumburl.match(/\.(jpe?g|png|webp)$/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg')
  const file = `${name}.${extension}`
  await sleep(1500)
  const image = Buffer.from(await (await fetchWithRetry(info.thumburl)).arrayBuffer())
  writeFileSync(join(OUT_DIR, file), image)

  console.log(`Сохранено: public/content-images/${file} (${Math.round(image.length / 1024)} КБ)`)
  console.log(`Лицензия: ${license}; автор: ${author}`)
  if (description) console.log(`Описание на Commons: ${description.slice(0, 200)}`)
  console.log('\nДля урока (alt и подпись допишите по смыслу):\n')
  console.log(
    `<figure><img src="/content-images/${file}" alt="ОПИСАНИЕ" loading="lazy">` +
      `<figcaption>Рис. N. ПОДПИСЬ. <small>Фото: ${escape(author)}, ${escape(license)}, Wikimedia Commons (${escape(info.descriptionurl)})</small></figcaption></figure>`,
  )
}

main().catch((error: Error) => {
  console.error(`✗ ${error.message}`)
  process.exitCode = 1
})
