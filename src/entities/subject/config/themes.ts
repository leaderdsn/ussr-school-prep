import type { Era, Subject } from '../model/types'

/**
 * Look of a subject: the app partially takes it on inside the subject (accent, lesson paper, emblem).
 * Soviet subjects get an exercise-book sheet (squared, ruled, graph paper), RF subjects a clean modern sheet.
 * Colours are a stylisation, not a claim about real textbook covers.
 */
export type PaperPattern = 'squared' | 'ruled' | 'millimeter' | 'stars' | 'book' | 'plain'

export type SubjectTheme = {
  /** Accent for the light theme and for the dark (chalkboard) theme. */
  accent: { light: string; dark: string }
  pattern: PaperPattern
  /** Emblem on the "textbook cover": a PrimeIcons class or a drawn icon of SubjectIcon ("svg:<name>"). */
  icon: string
}

const ERA_THEMES: Readonly<Record<Era, SubjectTheme>> = {
  ussr: { accent: { light: '#4a3a9c', dark: '#c9bcff' }, pattern: 'squared', icon: 'pi pi-book' },
  rf: { accent: { light: '#1971c2', dark: '#74c0fc' }, pattern: 'plain', icon: 'pi pi-graduation-cap' },
}

const SUBJECT_THEMES: Readonly<Record<string, Partial<SubjectTheme>>> = {
  math: { accent: { light: '#b3261e', dark: '#ff8a80' }, pattern: 'squared', icon: 'pi pi-calculator' },
  algebra: { accent: { light: '#1d5b8f', dark: '#8cc2ff' }, pattern: 'squared', icon: 'svg:algebra' },
  geometry: { accent: { light: '#2e6b3a', dark: '#8fd19e' }, pattern: 'squared', icon: 'svg:geometry' },
  russian: { accent: { light: '#6d2f8a', dark: '#d3a6f0' }, pattern: 'ruled', icon: 'svg:russian' },
  reading: { accent: { light: '#9a3b1f', dark: '#ffab91' }, pattern: 'book', icon: 'svg:reading' },
  literature: { accent: { light: '#5b3a29', dark: '#e0b8a0' }, pattern: 'book', icon: 'svg:literature' },
  physics: { accent: { light: '#a14a12', dark: '#ffb37a' }, pattern: 'millimeter', icon: 'svg:physics' },
  chemistry: { accent: { light: '#1f6f6a', dark: '#7fd6cd' }, pattern: 'squared', icon: 'svg:chemistry' },
  astronomy: { accent: { light: '#26346e', dark: '#a9b8ff' }, pattern: 'stars', icon: 'svg:astronomy' },
  'world-around': { accent: { light: '#2b8a3e', dark: '#69db7c' }, icon: 'pi pi-globe' },
  'social-studies': { accent: { light: '#1864ab', dark: '#74c0fc' }, icon: 'svg:social-studies' },
}

export function subjectTheme(subject: Pick<Subject, 'id' | 'era'>): SubjectTheme {
  return { ...ERA_THEMES[subject.era], ...SUBJECT_THEMES[subject.id] }
}

/** The accent as one CSS value that follows the light/dark colour scheme. */
export function accentValue(theme: SubjectTheme): string {
  return `light-dark(${theme.accent.light}, ${theme.accent.dark})`
}

const line = 'var(--app-grid-line)'
const faint = `color-mix(in srgb, ${line} 45%, transparent)`
const grid = (color: string) =>
  `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`

const PAPERS: Readonly<Record<PaperPattern, { image: string; size: string }>> = {
  squared: { image: grid(line), size: '1.25rem 1.25rem, 1.25rem 1.25rem' },
  ruled: { image: `linear-gradient(transparent calc(100% - 1px), ${line} 0)`, size: '100% 1.75rem' },
  millimeter: {
    image: `${grid(line)}, ${grid(faint)}`,
    size: '2.5rem 2.5rem, 2.5rem 2.5rem, 0.5rem 0.5rem, 0.5rem 0.5rem',
  },
  stars: {
    image: [
      `radial-gradient(circle at 18% 28%, ${line} 1.5px, transparent 2px)`,
      `radial-gradient(circle at 72% 64%, ${line} 1px, transparent 1.5px)`,
      `radial-gradient(circle at 44% 86%, ${line} 2px, transparent 2.5px)`,
    ].join(', '),
    size: '7rem 7rem, 5rem 5rem, 11rem 11rem',
  },
  // A book page: no ruling, only a soft shade towards the spine and the outer edge.
  book: {
    image: 'linear-gradient(90deg, rgb(90 60 20 / 9%), transparent 2.5rem, transparent calc(100% - 1.5rem), rgb(90 60 20 / 6%))',
    size: '100% 100%',
  },
  plain: { image: 'none', size: 'auto' },
}

/**
 * CSS variables that restyle the app for a subject; set on <html> by useSubjectTheme.
 * Graph paper and star maps take the subject colour for their lines.
 */
export function subjectThemeVars(theme: SubjectTheme): Record<string, string> {
  const accent = accentValue(theme)
  const paper = PAPERS[theme.pattern]
  const vars: Record<string, string> = {
    '--app-link': accent,
    '--app-on-link': 'light-dark(#ffffff, #14110d)',
    '--app-paper-image': paper.image,
    '--app-paper-size': paper.size,
  }
  if (theme.pattern === 'millimeter' || theme.pattern === 'stars') {
    // Graph paper and star maps are only a faint hint behind the text, so the lines stay light.
    const strength = theme.pattern === 'millimeter' ? 13 : 22
    vars['--app-grid-line'] = `color-mix(in srgb, ${accent} ${strength}%, transparent)`
  }
  return vars
}
