import type { Era } from './types'

export const ERA_LABELS: Readonly<Record<Era, string>> = {
  ussr: 'По советским учебникам',
  rf: 'По программе РФ',
}

/** Title of the comparison block under each topic. */
export const COMPARE_TITLES: Readonly<Record<Era, string>> = {
  ussr: 'Сейчас в российской школе',
  rf: 'А как было в СССР',
}
