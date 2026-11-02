import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { isSameData, mergeFamily, parseFamily, useProgressStore } from '@/entities/progress'
import { env } from '@/shared/config'

import { childrenPath, SYNC_ENABLED_KEY } from '../config/sync'

import type { SyncStatus } from '../config/sync'
import type { FamilySnapshot } from '@/entities/progress'
import type * as AuthApi from 'firebase/auth'
import type * as DbApi from 'firebase/database'

export type SyncUser = { name: string; email: string; photoUrl: string | null }

type Sdk = {
  auth: AuthApi.Auth
  db: DbApi.Database
  authApi: typeof AuthApi
  dbApi: typeof DbApi
}

// Closing the popup is a normal way to change one's mind, not an error.
const SILENT_AUTH_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

function readEnabled(): boolean {
  try {
    return localStorage.getItem(SYNC_ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

function writeEnabled(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(SYNC_ENABLED_KEY, '1')
    else localStorage.removeItem(SYNC_ENABLED_KEY)
  } catch {
    // Without storage the parent just signs in again on the next visit.
  }
}

function errorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
}

/** Parent's Google sign-in and live sync of all children's progress through Firebase Realtime Database. */
export const useSyncStore = defineStore('sync', () => {
  const progress = useProgressStore()

  const available = env.firebase !== null
  const user = ref<SyncUser | null>(null)
  const status = ref<SyncStatus>('off')
  const error = ref<string | null>(null)
  const busy = ref(false)

  let sdk: Promise<Sdk> | null = null
  let stopSession: (() => void) | null = null

  function loadSdk(): Promise<Sdk> {
    const config = env.firebase
    if (!config) return Promise.reject(new Error('Firebase не настроен'))
    // SDK modules are split into their own chunk and load only when sync is used.
    sdk ??= Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/database')]).then(
      ([{ getApp, getApps, initializeApp }, authApi, dbApi]) => {
        const app = getApps().length ? getApp() : initializeApp(config)
        const auth = authApi.getAuth(app)
        const loaded: Sdk = { auth, db: dbApi.getDatabase(app), authApi, dbApi }
        authApi.onAuthStateChanged(auth, (account) => {
          stopSession?.()
          stopSession = null
          if (!account) {
            user.value = null
            status.value = 'off'
            return
          }
          user.value = { name: account.displayName ?? '', email: account.email ?? '', photoUrl: account.photoURL }
          stopSession = startSession(loaded, account.uid)
        })
        return loaded
      },
    )
    return sdk
  }

  function fail(cause: unknown) {
    status.value = 'error'
    error.value = cause instanceof Error ? cause.message : 'Не удалось синхронизировать прогресс'
  }

  /**
   * The first snapshot is merged with this device's family, so nothing done before sign-in is lost.
   * After that the database is the source of truth: remote changes replace local ones, and each
   * child changed locally is written back separately (`children/<id>`), so devices of different
   * children do not overwrite each other.
   */
  function startSession({ db, dbApi }: Sdk, uid: string): () => void {
    const path = childrenPath(uid)
    const target = dbApi.ref(db, path)
    let lastRemote: FamilySnapshot | null = null
    let connected = false
    status.value = 'connecting'
    error.value = null

    const push = (next: FamilySnapshot) => {
      const previous = lastRemote ?? {}
      lastRemote = next
      const updates: Record<string, unknown> = {}
      for (const [id, record] of Object.entries(next)) {
        if (!isSameData(record, previous[id])) updates[id] = record
      }
      for (const id of Object.keys(previous)) if (!(id in next)) updates[id] = null
      if (Object.keys(updates).length > 0) dbApi.update(target, updates).catch(fail)
    }

    const offFamily = dbApi.onValue(
      target,
      (snap) => {
        const remote = parseFamily(snap.val())
        const local = progress.snapshot()
        if (lastRemote === null) {
          const merged = mergeFamily(local, remote)
          if (!isSameData(merged, local)) progress.applySnapshot(merged)
          lastRemote = remote
          push(progress.snapshot())
        } else {
          lastRemote = remote
          if (!isSameData(remote, local)) progress.applySnapshot(remote)
        }
        status.value = connected ? 'online' : 'offline'
      },
      fail,
    )

    const offConnected = dbApi.onValue(dbApi.ref(db, '.info/connected'), (snap) => {
      connected = snap.val() === true
      if (lastRemote !== null && status.value !== 'error') status.value = connected ? 'online' : 'offline'
    })

    const stopWatch = watch(
      () => progress.family,
      () => {
        if (lastRemote !== null) push(progress.snapshot())
      },
      { deep: true },
    )

    return () => {
      offFamily()
      offConnected()
      stopWatch()
    }
  }

  /** Restores the session of a parent who signed in earlier. */
  function init() {
    if (available && readEnabled()) loadSdk().catch(fail)
  }

  async function signIn() {
    busy.value = true
    error.value = null
    try {
      const { auth, authApi } = await loadSdk()
      await authApi.signInWithPopup(auth, new authApi.GoogleAuthProvider())
      writeEnabled(true)
    } catch (cause) {
      if (!SILENT_AUTH_ERRORS.has(errorCode(cause))) fail(cause)
    } finally {
      busy.value = false
    }
  }

  /** Progress stays on this device; it just stops syncing. */
  async function signOut() {
    writeEnabled(false)
    error.value = null
    const { auth, authApi } = await loadSdk()
    await authApi.signOut(auth)
  }

  return { available, user, status, error, busy, init, signIn, signOut }
})
