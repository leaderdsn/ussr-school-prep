import { env } from '../config'

import type * as AuthApi from 'firebase/auth'
import type * as DbApi from 'firebase/database'

export type FirebaseSdk = {
  auth: AuthApi.Auth
  db: DbApi.Database
  authApi: typeof AuthApi
  dbApi: typeof DbApi
}

let sdk: Promise<FirebaseSdk> | null = null

export function isFirebaseConfigured(): boolean {
  return env.firebase !== null
}

/** The Firebase SDK, split into its own chunk and loaded once, only when something needs it. */
export function loadFirebase(): Promise<FirebaseSdk> {
  const config = env.firebase
  if (!config) return Promise.reject(new Error('Firebase не настроен'))
  sdk ??= Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/database')]).then(
    ([{ getApp, getApps, initializeApp }, authApi, dbApi]) => {
      const app = getApps().length ? getApp() : initializeApp(config)
      return { auth: authApi.getAuth(app), db: dbApi.getDatabase(app), authApi, dbApi }
    },
  )
  return sdk
}

/**
 * Reads a public path of the Realtime Database over REST, without loading the SDK.
 * Null when Firebase is not configured, the path is empty, or the request fails or times out.
 */
export async function fetchPublicData(path: string, timeoutMs = 4000): Promise<unknown> {
  const base = env.firebase?.databaseURL
  if (!base) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/${path}.json`, { signal: controller.signal })
    return response.ok ? ((await response.json()) as unknown) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
