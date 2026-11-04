<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useProgressStore } from '@/entities/progress'
import { COMPARE_TITLES, ERA_LABELS, fetchGrade, findGrade, SubjectIcon, subjectTheme, useSubjectTheme } from '@/entities/subject'
import { ControlRunner } from '@/features/run-control'
import { QuizRunner } from '@/features/run-quiz'
import { CONTROL_STEP, ROUTE_NAMES, TEST_STEP } from '@/shared/config'

import { paginateHtml, PAGINATE_FROM } from '../lib/paginate'

import GradeRail from './GradeRail.vue'
import TopicExercises from './TopicExercises.vue'

import type { Grade } from '@/entities/subject'
import type { GradeStep } from '@/shared/config'

const { gradeId, step } = defineProps<{ gradeId: string; step: string }>()

const router = useRouter()
const progress = useProgressStore()

const summary = computed(() => findGrade(gradeId))
const titles = computed(() => summary.value?.grade.topicTitles ?? [])
const current = computed<GradeStep>(() => (step === TEST_STEP || step === CONTROL_STEP ? step : Number(step)))
const heading = computed(() => (summary.value ? `${summary.value.subject.title}, ${summary.value.grade.grade} класс` : ''))
const theme = computed(() => (summary.value ? subjectTheme(summary.value.subject) : null))

// Inside the subject the app takes on its style: accent, lesson paper, Soviet or modern typography.
useSubjectTheme(() => summary.value?.subject ?? null)

const grade = ref<Grade | null>(null)
const loading = ref(false)
const failed = ref(false)

const gradeProgress = computed(() => progress.getGrade(gradeId))
const seenCount = computed(() => Math.min(gradeProgress.value.seenTopics.length, titles.value.length))
const percent = computed(() => (titles.value.length === 0 ? 0 : Math.round((seenCount.value / titles.value.length) * 100)))
const topic = computed(() => (typeof current.value === 'number' ? (grade.value?.topics[current.value - 1] ?? null) : null))
// Long reading texts are split into book pages; exercises and the comparison come after the last page.
const pages = computed(() => {
  const html = topic.value?.html ?? ''
  return theme.value?.pattern === 'book' && html.length > PAGINATE_FROM ? paginateHtml(html) : [html]
})
const page = ref(0)
const lessonTop = ref<HTMLElement | null>(null)
const onLastPage = computed(() => page.value >= pages.value.length - 1)
const isLastTopic = computed(() => current.value === titles.value.length)

watch(() => gradeId, load, { immediate: true })
watch([() => gradeId, current], () => {
  page.value = 0
})

function turnPage(delta: number) {
  page.value = Math.min(Math.max(page.value + delta, 0), pages.value.length - 1)
  lessonTop.value?.scrollIntoView({ block: 'start' })
}

watch(
  [() => gradeId, current],
  ([id, value]) => {
    progress.setLastVisited({ gradeId: id, step: value })
    if (typeof value === 'number') progress.markTopicSeen(id, value - 1)
  },
  { immediate: true },
)

async function load() {
  grade.value = null
  failed.value = false
  loading.value = true
  const requested = gradeId
  try {
    const loaded = await fetchGrade(requested)
    if (requested === gradeId) grade.value = loaded
  } catch {
    if (requested === gradeId) failed.value = true
  } finally {
    if (requested === gradeId) loading.value = false
  }
}

function goTo(target: GradeStep) {
  return router.push({ name: ROUTE_NAMES.grade, params: { gradeId, step: String(target) } })
}
</script>

<template>
  <div v-if="summary" class="grade-page">
    <RouterLink class="grade-page__back" :to="{ name: ROUTE_NAMES.home, query: { grade: summary.grade.grade } }">
      <i class="pi pi-arrow-left" aria-hidden="true" />
      Все предметы
    </RouterLink>

    <header class="cover" :class="`cover--${summary.subject.era}`">
      <span class="cover__emblem" aria-hidden="true"><SubjectIcon v-if="theme" :icon="theme.icon" /></span>
      <div class="cover__heading">
        <p class="cover__eyebrow">{{ ERA_LABELS[summary.subject.era] }}</p>
        <h1 class="cover__title">{{ heading }}</h1>
        <p class="cover__meta">
          {{ summary.grade.textbook }}
          <template v-if="summary.grade.ussrGrade"> · в СССР — {{ summary.grade.ussrGrade }} класс</template>
        </p>
      </div>
      <div class="cover__progress">
        <span>Прочитано тем: {{ seenCount }} из {{ titles.length }}</span>
        <ProgressBar :value="percent" :show-value="false" aria-label="Прогресс по темам класса" class="cover__bar" />
      </div>
    </header>

    <div class="grade-page__layout">
      <GradeRail
        :grade-id="gradeId"
        :titles="titles"
        :seen-topics="gradeProgress.seenTopics"
        :step="current"
        :test-passed="gradeProgress.test.passedAt !== null"
        :control-passed="gradeProgress.control.passedAt !== null"
      />

      <section ref="lessonTop" class="lesson" :class="[`lesson--${summary.subject.era}`, { 'lesson--book': theme?.pattern === 'book' }]" aria-live="polite" :aria-busy="loading">
        <div v-if="loading" class="lesson__loading" role="status">
          <span class="visually-hidden">Загружаем материал…</span>
          <Skeleton height="2rem" width="60%" />
          <Skeleton height="5rem" />
          <Skeleton height="8rem" />
        </div>

        <div v-else-if="failed" class="lesson__error">
          <Message severity="error">Не получилось загрузить материал. Проверьте соединение и попробуйте ещё раз.</Message>
          <Button label="Повторить" icon="pi pi-refresh" severity="secondary" @click="load" />
        </div>

        <template v-else-if="grade">
          <template v-if="current === TEST_STEP">
            <h2 class="lesson__title">Тест: {{ heading }}</h2>
            <QuizRunner :key="gradeId" :grade="grade" @review-topic="goTo($event + 1)" />
            <nav class="lesson__nav" aria-label="Переход между шагами">
              <Button
                :label="`К теме ${titles.length}`"
                icon="pi pi-arrow-left"
                severity="secondary"
                variant="outlined"
                @click="goTo(titles.length)"
              />
              <Button label="К контрольной" icon="pi pi-arrow-right" icon-pos="right" @click="goTo(CONTROL_STEP)" />
            </nav>
          </template>

          <template v-else-if="current === CONTROL_STEP">
            <h2 class="lesson__title">Контрольная работа: {{ heading }}</h2>
            <ControlRunner :key="gradeId" :grade="grade" @review-topic="goTo($event + 1)" />
            <nav class="lesson__nav" aria-label="Переход между шагами">
              <Button label="К тесту" icon="pi pi-arrow-left" severity="secondary" variant="outlined" @click="goTo(TEST_STEP)" />
            </nav>
          </template>

          <template v-else-if="topic">
            <h2 class="lesson__title">{{ current }}. {{ topic.title }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- trusted HTML bundled with the app -->
            <article class="content" v-html="pages[page]" />
            <nav v-if="pages.length > 1" class="lesson__pager" aria-label="Страницы темы">
              <Button icon="pi pi-angle-left" aria-label="Предыдущая страница" rounded severity="secondary" variant="text" :disabled="page === 0" @click="turnPage(-1)" />
              <span class="lesson__page-number">— {{ page + 1 }} / {{ pages.length }} —</span>
              <Button icon="pi pi-angle-right" aria-label="Следующая страница" rounded severity="secondary" variant="text" :disabled="onLastPage" @click="turnPage(1)" />
            </nav>
            <TopicExercises v-if="onLastPage" :exercises="topic.exercises" :topic-key="`${gradeId}:${current}`" />
            <aside v-if="onLastPage" class="compare" :class="`compare--${summary.subject.era}`" aria-labelledby="compare-title">
              <h3 id="compare-title" class="compare__title">
                <i class="pi pi-arrow-right-arrow-left" aria-hidden="true" />
                {{ COMPARE_TITLES[summary.subject.era] }}
              </h3>
              <!-- eslint-disable-next-line vue/no-v-html -- trusted HTML bundled with the app -->
              <div class="content" v-html="topic.compare" />
            </aside>
            <nav class="lesson__nav" aria-label="Переход между шагами">
              <Button
                v-if="Number(current) > 1"
                label="Назад"
                icon="pi pi-arrow-left"
                severity="secondary"
                variant="outlined"
                @click="goTo(Number(current) - 1)"
              />
              <span v-else />
              <Button
                :label="isLastTopic ? 'К тесту' : 'Дальше'"
                :icon="isLastTopic ? 'pi pi-list-check' : 'pi pi-arrow-right'"
                icon-pos="right"
                @click="goTo(isLastTopic ? TEST_STEP : Number(current) + 1)"
              />
            </nav>
          </template>
        </template>
      </section>
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use './GradePage'
</style>
