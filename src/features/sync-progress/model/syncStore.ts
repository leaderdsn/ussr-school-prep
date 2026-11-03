import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { isSameData, mergeFamily, parseFamily, useProgressStore } from '@/entities/progress'
import { useSessionStore } from '@/entities/session'
import { loadFirebase } from '@/shared/lib'

import { childrenPath } from '../config/sync'

import type { SyncStatus } from '../config/sync'
import type { FamilySnapshot } from '@/entities/progress'
import type { FirebaseSdk } from '@/shared/lib'

/** Live sync of all children's progress with the signed-in parent's account in Firebase Realtime Database. */
export const useSyncStore = defineStore('sync', () => {
  const progress = useProgressStore()
  const session = useSessionStore()

  const status = ref<SyncStatus>('off')
  const syncError = ref<string | null>(null)

  let stopSession: (() => void) | null = null
  let started = false

  function fail(cause: unknown) {
    status.value = 'error'
    syncError.value = cause instanceof Error ? cause.message : 'Не удалось синхронизировать прогресс'
  }

  /**
   * The first snapshot is merged with this device's family, so nothing done before sign-in is lost.
   * After that the database is the source of truth: remote changes replace local ones, and each
   * child changed locally is written back separately (`children/<id>`), so devices of different
   * children do not overwrite each other.
   */
  function startSession({ db, dbApi }: FirebaseSdk, uid: string): () => void {
    const target = dbApi.ref(db, childrenPath(uid))
    let lastRemote: FamilySnapshot | null = null
    let connected = false
    status.value = 'connecting'
    syncError.value = null

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

  /** Follows the session: syncing runs while someone is signed in. */
  function init() {
    if (started) return
    started = true
    session.init()
    watch(
      () => session.user?.uid ?? null,
      async (uid) => {
        stopSession?.()
        stopSession = null
        if (!uid) {
          status.value = 'off'
          return
        }
        try {
          stopSession = startSession(await loadFirebase(), uid)
        } catch (cause) {
          fail(cause)
        }
      },
      { immediate: true },
    )
  }

  /** Progress stays on this device; it just stops syncing. */
  function signOut() {
    return session.signOut()
  }

  return {
    available: session.available,
    user: computed(() => session.user),
    busy: computed(() => session.busy),
    error: computed(() => syncError.value ?? session.error),
    status,
    init,
    signIn: () => session.signIn(),
    signOut,
  }
})
