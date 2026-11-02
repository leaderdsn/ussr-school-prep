import { defineStore } from 'pinia'
import { computed, ref, toRaw, watch } from 'vue'

import { DEFAULT_CHILD_NAME, PASS_SCORES, PROGRESS_STORAGE_KEY, PROGRESS_VERSION } from '../config/storage'
import { createId, dayKey } from '../lib/day'
import {
  createEmptyChildProgress,
  createEmptyGrade,
  isRecord,
  parseChildProgress,
  parseFamily,
} from '../lib/parse'

import type {
  AttemptRecord,
  Child,
  ChildProgress,
  ChildRecord,
  FamilySnapshot,
  GradeProgress,
  LastVisited,
} from './types'

/** Local copy: the family plus the profile chosen on THIS device (not synced). */
type Persisted = { version: number; children: FamilySnapshot; activeChildId: string | null }

export type NewAttempt = Omit<AttemptRecord, 'id' | 'at'>

function createChild(name: string, progress: ChildProgress = createEmptyChildProgress()): ChildRecord {
  return { profile: { id: createId('child'), name, createdAt: new Date().toISOString() }, progress }
}

/** v2 as is; v1 (one learner) becomes the progress of the default profile. */
function parsePersisted(data: unknown): { family: FamilySnapshot; activeChildId: string | null } | null {
  if (!isRecord(data)) return null
  if (data.version === PROGRESS_VERSION && isRecord(data.children)) {
    return {
      family: parseFamily(data.children),
      activeChildId: typeof data.activeChildId === 'string' ? data.activeChildId : null,
    }
  }
  if (data.version === 1 && isRecord(data.grades)) {
    const record = createChild(DEFAULT_CHILD_NAME, parseChildProgress(data))
    return { family: { [record.profile.id]: record }, activeChildId: record.profile.id }
  }
  return null
}

function readStored(): ReturnType<typeof parsePersisted> {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    return raw ? parsePersisted(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function store(payload: Persisted) {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage may be unavailable (private mode) — progress still lives for the session.
  }
}

function byCreation(a: Child, b: Child): number {
  return Date.parse(a.createdAt) - Date.parse(b.createdAt)
}

export const useProgressStore = defineStore('progress', () => {
  const stored = readStored()
  const family = ref<FamilySnapshot>(stored?.family ?? {})
  const activeChildId = ref<string | null>(stored?.activeChildId ?? null)

  const children = computed(() => Object.values(family.value).map((record) => record.profile).sort(byCreation))

  /** There is always at least one profile, and one of them is active. */
  function ensureActive() {
    if (children.value.length === 0) {
      const record = createChild(DEFAULT_CHILD_NAME)
      family.value = { ...family.value, [record.profile.id]: record }
    }
    if (!activeChildId.value || !family.value[activeChildId.value]) activeChildId.value = children.value[0]!.id
  }
  ensureActive()

  const activeRecord = computed(() => family.value[activeChildId.value!]!)
  const activeChild = computed(() => activeRecord.value.profile)
  const current = computed(() => activeRecord.value.progress)
  const grades = computed(() => current.value.grades)
  const lastVisited = computed(() => current.value.lastVisited)

  function payload(): Persisted {
    return { version: PROGRESS_VERSION, children: family.value, activeChildId: activeChildId.value }
  }

  watch([family, activeChildId], () => store(payload()), { deep: true })

  // --- profiles ---

  function addChild(name: string): string {
    const record = createChild(name.trim() || DEFAULT_CHILD_NAME)
    family.value[record.profile.id] = record
    return record.profile.id
  }

  function renameChild(childId: string, name: string) {
    const record = family.value[childId]
    if (record && name.trim()) record.profile.name = name.trim()
  }

  /** The last profile cannot be removed. */
  function removeChild(childId: string): boolean {
    if (!family.value[childId] || children.value.length <= 1) return false
    delete family.value[childId]
    ensureActive()
    return true
  }

  function selectChild(childId: string) {
    if (family.value[childId]) activeChildId.value = childId
  }

  function progressOf(childId: string): ChildProgress {
    return family.value[childId]?.progress ?? createEmptyChildProgress()
  }

  // --- progress of the active child ---

  function getGrade(gradeId: string): GradeProgress {
    return grades.value[gradeId] ?? createEmptyGrade()
  }

  function ensureGrade(gradeId: string): GradeProgress {
    return (current.value.grades[gradeId] ??= createEmptyGrade())
  }

  function markTopicSeen(gradeId: string, topicIndex: number) {
    const grade = ensureGrade(gradeId)
    if (grade.seenTopics.includes(topicIndex)) return
    grade.seenTopics = [...grade.seenTopics, topicIndex].sort((a, b) => a - b)
  }

  function recordAttempt(attempt: NewAttempt): AttemptRecord {
    const record: AttemptRecord = { ...attempt, id: createId('a'), at: new Date().toISOString() }
    current.value.history.push(record)

    const result = ensureGrade(attempt.gradeId)[attempt.kind]
    result.attempts += 1
    result.lastScore = attempt.percent
    result.bestScore = Math.max(result.bestScore ?? 0, attempt.percent)
    if (attempt.percent >= PASS_SCORES[attempt.kind] && result.passedAt === null) result.passedAt = record.at
    return record
  }

  function addActivity(seconds: number, date: Date = new Date()) {
    if (seconds <= 0) return
    const day = dayKey(date)
    const { activity } = current.value
    activity[day] = (activity[day] ?? 0) + Math.round(seconds)
  }

  function setLastVisited(value: LastVisited) {
    current.value.lastVisited = { ...value }
  }

  function resetGrade(gradeId: string) {
    delete current.value.grades[gradeId]
    if (current.value.lastVisited?.gradeId === gradeId) current.value.lastVisited = null
  }

  /** Clears the progress of every child; profiles stay. */
  function resetAll() {
    for (const record of Object.values(family.value)) record.progress = createEmptyChildProgress()
  }

  // --- sync and files ---

  /** Detached copy, safe to send over the network or compare. */
  function snapshot(): FamilySnapshot {
    return structuredClone(toRaw(family.value))
  }

  function applySnapshot(value: FamilySnapshot) {
    family.value = structuredClone(value)
    ensureActive()
  }

  function exportJson(): string {
    return JSON.stringify({ version: PROGRESS_VERSION, children: family.value }, null, 2)
  }

  /** Replaces all profiles with the file's; a v1 file goes to the active child. */
  function importJson(json: string) {
    let data: unknown
    try {
      data = JSON.parse(json)
    } catch {
      throw new Error('Файл не является корректным JSON')
    }
    const parsed = parsePersisted(data)
    if (!parsed || Object.keys(parsed.family).length === 0) throw new Error('Неверный формат файла прогресса')

    if (isRecord(data) && data.version === 1) {
      activeRecord.value.progress = Object.values(parsed.family)[0]!.progress
      return
    }
    family.value = parsed.family
    ensureActive()
  }

  return {
    family,
    activeChildId,
    children,
    activeChild,
    current,
    grades,
    lastVisited,
    addChild,
    renameChild,
    removeChild,
    selectChild,
    progressOf,
    getGrade,
    markTopicSeen,
    recordAttempt,
    addActivity,
    setLastVisited,
    resetGrade,
    resetAll,
    snapshot,
    applySnapshot,
    exportJson,
    importJson,
  }
})
