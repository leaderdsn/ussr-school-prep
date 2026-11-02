export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'Школа СССР',
  isDev: import.meta.env.DEV,
} as const
