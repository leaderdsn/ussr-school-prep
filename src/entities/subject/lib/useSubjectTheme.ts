import { onScopeDispose, toValue, watch } from 'vue'

import { subjectTheme, subjectThemeVars } from '../config/themes'

import type { Subject } from '../model/types'
import type { MaybeRefOrGetter } from 'vue'

/**
 * While the current scope lives, dresses the whole app in the subject's style: `data-era` switches
 * Soviet / modern typography and paper (app/styles/main.sass), inline variables set the accent and the lesson sheet.
 */
export function useSubjectTheme(subject: MaybeRefOrGetter<Pick<Subject, 'id' | 'era'> | null>) {
  const root = document.documentElement
  let applied: string[] = []

  function clear() {
    for (const name of applied) root.style.removeProperty(name)
    applied = []
    delete root.dataset.era
    delete root.dataset.subject
  }

  watch(
    () => toValue(subject),
    (value) => {
      clear()
      if (!value) return
      root.dataset.era = value.era
      root.dataset.subject = value.id
      for (const [name, css] of Object.entries(subjectThemeVars(subjectTheme(value)))) {
        root.style.setProperty(name, css)
        applied.push(name)
      }
    },
    { immediate: true },
  )

  onScopeDispose(clear)
}
