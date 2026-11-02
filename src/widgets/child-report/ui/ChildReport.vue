<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { fetchGrade } from '@/entities/subject'
import { CONTROL_STEP, ROUTE_NAMES, TEST_STEP } from '@/shared/config'

import {
  activityDays,
  formatDuration,
  gradeLabel,
  gradeRows,
  isPassed,
  mistakeDetail,
  mistakeGroups,
  recentAttempts,
  reportTotals,
  resultLabel,
} from '../lib/report'

import type { ChildProgress, ResultKind } from '@/entities/progress'
import type { Grade } from '@/entities/subject'

const { progress } = defineProps<{ progress: ChildProgress }>()

const HISTORY_PREVIEW = 10
const ACTIVITY_DAYS = 14
const KIND_LABELS: Record<ResultKind, string> = { test: 'Тест', control: 'Контрольная' }

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
const weekdayFormat = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })

const totals = computed(() => reportTotals(progress))
const days = computed(() => activityDays(progress.activity, ACTIVITY_DAYS))
const maxMinutes = computed(() => Math.max(1, ...days.value.map((day) => day.minutes)))
const rows = computed(() => gradeRows(progress))
const groups = computed(() => mistakeGroups(progress))

const showAllHistory = ref(false)
const history = computed(() => recentAttempts(progress, showAllHistory.value ? undefined : HISTORY_PREVIEW))

// Question texts and right answers live in the grade files; load the ones the mistakes refer to.
const loadedGrades = ref<Record<string, Grade>>({})
watch(
  () => [...new Set(groups.value.map((group) => group.gradeId))],
  async (ids) => {
    for (const id of ids) {
      if (loadedGrades.value[id]) continue
      try {
        loadedGrades.value = { ...loadedGrades.value, [id]: await fetchGrade(id) }
      } catch {
        // Without the file the report still lists the topics to repeat.
      }
    }
  },
  { immediate: true },
)

function details(gradeId: string, kind: ResultKind) {
  const grade = loadedGrades.value[gradeId]
  const group = groups.value.find((item) => item.gradeId === gradeId && item.kind === kind)
  if (!grade || !group) return []
  return group.attempt.mistakes.flatMap((mistake) => {
    const detail = mistakeDetail(grade, kind, mistake)
    return detail ? [detail] : []
  })
}

function stepLink(gradeId: string, step: number | typeof TEST_STEP | typeof CONTROL_STEP) {
  return { name: ROUTE_NAMES.grade, params: { gradeId, step: String(step) } }
}
</script>

<template>
  <div class="child-report">
    <ul class="report-tiles">
      <li class="report-tile">
        <span class="report-tile__value">{{ totals.minutesWeek }} мин</span>
        <span class="report-tile__label">занятий за 7 дней</span>
      </li>
      <li class="report-tile">
        <span class="report-tile__value">{{ totals.studyDays }}</span>
        <span class="report-tile__label">дней с занятиями, всего {{ formatDuration(totals.minutesTotal * 60) }}</span>
      </li>
      <li class="report-tile">
        <span class="report-tile__value">{{ totals.testsPassed }}</span>
        <span class="report-tile__label">тестов сдано</span>
      </li>
      <li class="report-tile">
        <span class="report-tile__value">{{ totals.controlsPassed }}</span>
        <span class="report-tile__label">контрольных зачтено</span>
      </li>
      <li class="report-tile">
        <span class="report-tile__value">{{ totals.averageMark ?? '—' }}</span>
        <span class="report-tile__label">средняя оценка за контрольные</span>
      </li>
    </ul>

    <section class="report-section" aria-labelledby="activity-title">
      <h3 id="activity-title" class="report-section__title">Время занятий за {{ ACTIVITY_DAYS }} дней</h3>
      <ol class="activity">
        <li v-for="day in days" :key="day.day" class="activity__day" :class="{ 'activity__day--empty': day.minutes === 0 }">
          <span class="activity__value">{{ day.minutes || '' }}</span>
          <span class="activity__bar" :style="{ height: `${(day.minutes / maxMinutes) * 100}%` }" aria-hidden="true" />
          <span class="activity__label">
            <span class="activity__weekday">{{ weekdayFormat.format(day.date) }}</span>
            {{ dayFormat.format(day.date) }}
          </span>
          <span class="visually-hidden">: {{ day.minutes }} мин</span>
        </li>
      </ol>
      <p class="report-section__hint">Минуты активной работы: время, когда вкладка открыта и ребёнок что-то делает.</p>
    </section>

    <section class="report-section" aria-labelledby="grades-title">
      <h3 id="grades-title" class="report-section__title">Сводка по классам</h3>
      <p v-if="rows.length === 0" class="report-section__empty">Пока ни одного открытого класса.</p>
      <div v-else class="report-table">
        <table>
          <thead>
            <tr>
              <th scope="col">Предмет</th>
              <th scope="col">Темы</th>
              <th scope="col">Тест, лучший</th>
              <th scope="col">Контрольная, лучшая</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.gradeId">
              <th scope="row">
                <RouterLink :to="stepLink(row.gradeId, 1)">{{ row.subject.title }}, {{ row.summary.grade }} кл.</RouterLink>
              </th>
              <td>{{ row.seenTopics }} из {{ row.summary.topicTitles.length }}</td>
              <td>
                <template v-if="row.testBest !== null">
                  <span class="badge" :class="row.testPassed ? 'badge--good' : 'badge--bad'">{{ row.testBest }}%</span>
                  <span class="report-table__muted">попыток: {{ row.testAttempts }}</span>
                </template>
                <span v-else class="report-table__muted">не писал</span>
              </td>
              <td>
                <template v-if="row.controlMark !== null">
                  <span class="badge" :class="row.controlMark >= 3 ? 'badge--good' : 'badge--bad'">«{{ row.controlMark }}»</span>
                  <span class="report-table__muted">попыток: {{ row.controlAttempts }}</span>
                </template>
                <span v-else class="report-table__muted">не писал</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="report-section" aria-labelledby="mistakes-title">
      <h3 id="mistakes-title" class="report-section__title">Ошибки: что повторить</h3>
      <p class="report-section__hint">По последней попытке каждого теста и контрольной. Исправленные позже ошибки не показываются.</p>
      <p v-if="groups.length === 0" class="report-section__empty">Ошибок нет.</p>
      <ul v-else class="mistakes">
        <li v-for="group in groups" :key="`${group.gradeId}:${group.kind}`" class="mistakes__group">
          <p class="mistakes__head">
            <strong>{{ gradeLabel(group.gradeId) }}</strong> · {{ KIND_LABELS[group.kind] }} ·
            {{ dateFormat.format(new Date(group.attempt.at)) }} · ошибок: {{ group.attempt.mistakes.length }}
          </p>
          <p class="mistakes__topics">
            Повторить:
            <template v-for="(topic, i) in group.topics" :key="topic.index">
              <RouterLink :to="stepLink(group.gradeId, topic.index + 1)">{{ topic.title }}</RouterLink><template v-if="i < group.topics.length - 1">, </template>
            </template>
          </p>
          <details class="mistakes__details">
            <summary>Вопросы и ответы</summary>
            <ol class="mistakes__list">
              <li v-for="(item, i) in details(group.gradeId, group.kind)" :key="i">
                <p class="mistakes__question">{{ item.text }}</p>
                <p class="mistakes__answer mistakes__answer--given">Ответ ребёнка: {{ item.given || 'нет ответа' }}</p>
                <p class="mistakes__answer mistakes__answer--right">Правильно: {{ item.correct }}</p>
              </li>
            </ol>
          </details>
        </li>
      </ul>
    </section>

    <section class="report-section" aria-labelledby="history-title">
      <h3 id="history-title" class="report-section__title">История попыток</h3>
      <p v-if="history.length === 0" class="report-section__empty">Ещё нет ни одного теста или контрольной.</p>
      <div v-else class="report-table">
        <table>
          <thead>
            <tr>
              <th scope="col">Когда</th>
              <th scope="col">Что</th>
              <th scope="col">Результат</th>
              <th scope="col">Время</th>
              <th scope="col">Ошибок</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="attempt in history" :key="attempt.id">
              <td>{{ dateFormat.format(new Date(attempt.at)) }}</td>
              <td>
                <RouterLink :to="stepLink(attempt.gradeId, attempt.kind === 'test' ? TEST_STEP : CONTROL_STEP)">
                  {{ KIND_LABELS[attempt.kind] }}: {{ gradeLabel(attempt.gradeId) }}
                </RouterLink>
              </td>
              <td>
                <span class="badge" :class="isPassed(attempt) ? 'badge--good' : 'badge--bad'">{{ resultLabel(attempt) }}</span>
              </td>
              <td>{{ formatDuration(attempt.durationSec) }}</td>
              <td>{{ attempt.mistakes.length }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Button
        v-if="progress.history.length > HISTORY_PREVIEW"
        :label="showAllHistory ? 'Свернуть' : `Показать все (${progress.history.length})`"
        severity="secondary"
        variant="text"
        size="small"
        @click="showAllHistory = !showAllHistory"
      />
    </section>
  </div>
</template>

<style lang="sass" scoped>
@use './ChildReport'
</style>
