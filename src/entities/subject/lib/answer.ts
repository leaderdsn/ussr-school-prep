/**
 * Canonical form of a typed answer: case, «ё», extra spaces, decimal comma and dash variants
 * do not matter. Content still lists every accepted form ("10", "10 см", "на 10").
 */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[−‒–—]/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, ' ')
    .replace(/\s*([=+\-*/:<>])\s*/g, '$1')
    .trim()
    .replace(/[.!]+$/, '')
}

export function isAnswerAccepted(value: string, accepted: readonly string[]): boolean {
  const given = normalizeAnswer(value)
  return given !== '' && accepted.some((answer) => normalizeAnswer(answer) === given)
}
