import { onScopeDispose } from 'vue'

import { useProgressStore } from '@/entities/progress'

import { ACTIVITY_EVENTS, IDLE_MS, TICK_MS } from '../config/activity'

/**
 * Counts study time of the active child: a tick is added only while the tab is visible
 * and there was an interaction during the last IDLE_MS. Call once from the app root.
 */
export function useActivityTracker() {
  const progress = useProgressStore()
  let lastInput = Date.now()

  const markInput = () => {
    lastInput = Date.now()
  }

  const tick = () => {
    if (document.visibilityState !== 'visible' || Date.now() - lastInput > IDLE_MS) return
    progress.addActivity(TICK_MS / 1000)
  }

  for (const event of ACTIVITY_EVENTS) window.addEventListener(event, markInput, { passive: true, capture: true })
  const timer = window.setInterval(tick, TICK_MS)

  onScopeDispose(() => {
    window.clearInterval(timer)
    for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, markInput, { capture: true })
  })
}
