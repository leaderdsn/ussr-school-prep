/** How often active time is added to the child's day. */
export const TICK_MS = 15_000

/** Without a click, key press, scroll or touch for this long the child is considered away. */
export const IDLE_MS = 120_000

export const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const
