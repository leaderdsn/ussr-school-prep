import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { useSessionStore } from '@/entities/session'
import { contentPath } from '@/entities/subject'
import { loadFirebase } from '@/shared/lib'

import type { ControlTask, GradeOverride, QuizQuestion } from '@/entities/subject'

/** Admins are listed by hand in the database: `schoolPrep/admins/<uid>: true` (database.rules.json checks it). */
export const adminPath = (uid: string) => `schoolPrep/admins/${uid}`

/** Who may edit tests and control works, and saving their edits to the database. */
export const useAdminStore = defineStore('admin', () => {
  const session = useSessionStore()

  /** null while unknown (not signed in or still checking). */
  const isAdmin = ref<boolean | null>(null)
  const checking = ref(false)

  watch(
    () => session.user?.uid ?? null,
    async (uid) => {
      isAdmin.value = null
      if (!uid) return
      checking.value = true
      try {
        const { db, dbApi } = await loadFirebase()
        const snap = await dbApi.get(dbApi.ref(db, adminPath(uid)))
        if (session.user?.uid === uid) isAdmin.value = snap.val() === true
      } catch {
        // Reading someone else's admin flag is denied by the rules, so an error means "not an admin".
        if (session.user?.uid === uid) isAdmin.value = false
      } finally {
        checking.value = false
      }
    },
    { immediate: true },
  )

  async function save(gradeId: string, quiz: QuizQuestion[], control: ControlTask[]) {
    const { db, dbApi } = await loadFirebase()
    const value: GradeOverride = {
      quiz,
      control,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user?.email ?? '',
    }
    // JSON round trip drops reactive proxies and undefined fields, which the database rejects.
    await dbApi.set(dbApi.ref(db, contentPath(gradeId)), JSON.parse(JSON.stringify(value)))
  }

  async function reset(gradeId: string) {
    const { db, dbApi } = await loadFirebase()
    await dbApi.remove(dbApi.ref(db, contentPath(gradeId)))
  }

  return { isAdmin, checking, save, reset }
})
