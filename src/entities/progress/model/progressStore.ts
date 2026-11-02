import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { PASS_SCORES, PROGRESS_STORAGE_KEY, PROGRESS_VERSION } from '../config/storage'
import { createEmptyGrade, isRecord, parseGrade, parseGrades, parseLastVisited } from '../lib/parse'

import type { GradeProgress, LastVisited, ProgressSnapshot, ResultKind } from './types'

type Persisted = ProgressSnapshot & { version: number }

function readStored(): Persisted | null {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data) || data.version !== PROGRESS_VERSION) return null
    return {
      version: PROGRESS_VERSION,
      grades: parseGrades(data.grades),
      lastVisited: parseLastVisited(data.lastVisited),
    }
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

export const useProgressStore = defineStore('progress', () => {
  const stored = readStored()
  const grades = ref<Record<string, GradeProgress>>(stored?.grades ?? {})
  const lastVisited = ref<LastVisited | null>(stored?.lastVisited ?? null)

  function payload(): Persisted {
    return { version: PROGRESS_VERSION, grades: grades.value, lastVisited: lastVisited.value }
  }

  watch([grades, lastVisited], () => store(payload()), { deep: true })

  function getGrade(gradeId: string): GradeProgress {
    return grades.value[gradeId] ?? createEmptyGrade()
  }

  function ensureGrade(gradeId: string): GradeProgress {
    return (grades.value[gradeId] ??= createEmptyGrade())
  }

  function markTopicSeen(gradeId: string, topicIndex: number) {
    const grade = ensureGrade(gradeId)
    if (grade.seenTopics.includes(topicIndex)) return
    grade.seenTopics = [...grade.seenTopics, topicIndex].sort((a, b) => a - b)
  }

  function recordResult(gradeId: string, kind: ResultKind, percent: number) {
    const result = ensureGrade(gradeId)[kind]
    result.attempts += 1
    result.lastScore = percent
    result.bestScore = Math.max(result.bestScore ?? 0, percent)
    if (percent >= PASS_SCORES[kind] && result.passedAt === null) result.passedAt = new Date().toISOString()
  }

  function setLastVisited(value: LastVisited) {
    lastVisited.value = { ...value }
  }

  function resetGrade(gradeId: string) {
    delete grades.value[gradeId]
    if (lastVisited.value?.gradeId === gradeId) lastVisited.value = null
  }

  function resetAll() {
    grades.value = {}
    lastVisited.value = null
  }

  function exportJson(): string {
    return JSON.stringify(payload(), null, 2)
  }

  function importJson(json: string) {
    let data: unknown
    try {
      data = JSON.parse(json)
    } catch {
      throw new Error('Файл не является корректным JSON')
    }
    if (!isRecord(data) || data.version !== PROGRESS_VERSION || !isRecord(data.grades)) {
      throw new Error('Неверный формат файла прогресса')
    }

    const parsed: Record<string, GradeProgress> = {}
    for (const [id, value] of Object.entries(data.grades)) {
      const grade = parseGrade(value)
      if (!grade) throw new Error(`Некорректные данные прогресса для класса «${id}»`)
      parsed[id] = grade
    }

    grades.value = parsed
    lastVisited.value = parseLastVisited(data.lastVisited)
  }

  return {
    grades,
    lastVisited,
    getGrade,
    markTopicSeen,
    recordResult,
    setLastVisited,
    resetGrade,
    resetAll,
    exportJson,
    importJson,
  }
})
