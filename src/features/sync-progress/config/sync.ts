/** Set while the parent wants sync, so the Firebase SDK loads on start only for those who use it. */
export const SYNC_ENABLED_KEY = 'ussr-school-prep:sync'

/** Realtime Database path of the parent's children; database.rules.json allows it to its owner only. */
export const childrenPath = (uid: string) => `schoolPrep/users/${uid}/children`

export const SYNC_STATUS_LABELS = {
  off: 'Синхронизация выключена',
  connecting: 'Подключение…',
  online: 'Прогресс сохранён в аккаунте',
  offline: 'Нет сети — изменения отправятся позже',
  error: 'Ошибка синхронизации',
} as const

export type SyncStatus = keyof typeof SYNC_STATUS_LABELS
