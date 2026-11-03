import { defineStore } from 'pinia'
import { ref } from 'vue'

import { isFirebaseConfigured, loadFirebase } from '@/shared/lib'

import { SIGNED_IN_KEY } from '../config/session'

export type SessionUser = { uid: string; name: string; email: string; photoUrl: string | null }

// Closing the popup is a normal way to change one's mind, not an error.
const SILENT_AUTH_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

function readSignedIn(): boolean {
  try {
    return localStorage.getItem(SIGNED_IN_KEY) === '1'
  } catch {
    return false
  }
}

function writeSignedIn(value: boolean) {
  try {
    if (value) localStorage.setItem(SIGNED_IN_KEY, '1')
    else localStorage.removeItem(SIGNED_IN_KEY)
  } catch {
    // Without storage the user just signs in again on the next visit.
  }
}

function errorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
}

/** Google sign-in through Firebase Auth: the parent's account for progress sync and the admin's for content. */
export const useSessionStore = defineStore('session', () => {
  const available = isFirebaseConfigured()
  const user = ref<SessionUser | null>(null)
  const busy = ref(false)
  const error = ref<string | null>(null)

  let listening: Promise<void> | null = null

  function listen(): Promise<void> {
    listening ??= loadFirebase().then(({ auth, authApi }) => {
      authApi.onAuthStateChanged(auth, (account) => {
        user.value = account
          ? { uid: account.uid, name: account.displayName ?? '', email: account.email ?? '', photoUrl: account.photoURL }
          : null
      })
    })
    return listening
  }

  function fail(cause: unknown) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось войти'
  }

  /** Restores the session of someone who signed in earlier; loads Firebase only for them. */
  function init() {
    if (available && readSignedIn()) listen().catch(fail)
  }

  async function signIn() {
    busy.value = true
    error.value = null
    try {
      await listen()
      const { auth, authApi } = await loadFirebase()
      await authApi.signInWithPopup(auth, new authApi.GoogleAuthProvider())
      writeSignedIn(true)
    } catch (cause) {
      if (!SILENT_AUTH_ERRORS.has(errorCode(cause))) fail(cause)
    } finally {
      busy.value = false
    }
  }

  async function signOut() {
    writeSignedIn(false)
    error.value = null
    const { auth, authApi } = await loadFirebase()
    await authApi.signOut(auth)
  }

  return { available, user, busy, error, init, signIn, signOut }
})
