<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useProgressStore } from '@/entities/progress'
import { findGrade, GRADE_NUMBERS, GRADES } from '@/entities/subject'
import { ROUTE_NAMES } from '@/shared/config'
import { SubjectGrid } from '@/widgets/subject-grid'

import HomeScene from './HomeScene.vue'

import type { GradeNumber } from '@/entities/subject'

const route = useRoute()
const router = useRouter()
const progress = useProgressStore()

const totalTopics = GRADES.reduce((sum, grade) => sum + grade.topicTitles.length, 0)

const seenTopics = computed(() =>
  GRADES.reduce((sum, grade) => sum + Math.min(progress.getGrade(grade.id).seenTopics.length, grade.topicTitles.length), 0),
)
const passedControls = computed(() => GRADES.filter((grade) => progress.getGrade(grade.id).control.passedAt !== null).length)
const percent = computed(() => (totalTopics === 0 ? 0 : Math.round((seenTopics.value / totalTopics) * 100)))

const lastFound = computed(() => {
  const last = progress.lastVisited
  const found = last ? findGrade(last.gradeId) : null
  return last && found ? { last, found } : null
})

const resume = computed(() => {
  if (!lastFound.value) return null
  const { last, found } = lastFound.value
  return {
    to: { name: ROUTE_NAMES.grade, params: { gradeId: last.gradeId, step: String(last.step) } },
    label: `${found.subject.title}, ${found.grade.grade} класс`,
  }
})

const gradeOptions = GRADE_NUMBERS.map((value) => ({ value, label: String(value) }))

/** Selected grade lives in the URL (`?grade=7`) so the back link and browser history keep it. */
const selectedGrade = computed<GradeNumber>({
  get() {
    const value = Number(route.query.grade)
    if ((GRADE_NUMBERS as readonly number[]).includes(value)) return value as GradeNumber
    return lastFound.value?.found.grade.grade ?? 1
  },
  set(value) {
    void router.replace({ query: { ...route.query, grade: String(value) } })
  },
})
</script>

<template>
  <div class="home-page">
    <HomeScene />
    <section class="home-page__hero" aria-labelledby="home-title">
      <div class="home-page__intro">
        <h1 id="home-title" class="home-page__title">Школьная программа с 1 по 11 класс</h1>
        <p class="home-page__motto" aria-hidden="true">Повторение — мать учения</p>
        <p class="home-page__lead">
          Теория, тест и контрольная работа по каждому предмету. Предметы, которые были в СССР, — по советским
          учебникам, с пометкой, как их проходят сейчас. Новые предметы — по программе РФ.
        </p>
      </div>

      <div class="home-page__progress">
        <p class="home-page__child">Занимается: <strong>{{ progress.activeChild.name }}</strong></p>
        <p class="home-page__stats">
          <strong>{{ seenTopics }}</strong> из {{ totalTopics }} тем изучено ·
          <strong>{{ passedControls }}</strong> из {{ GRADES.length }} контрольных сдано
        </p>
        <ProgressBar :value="percent" :show-value="false" aria-label="Общий прогресс по темам" class="home-page__bar" />
        <RouterLink v-if="resume" v-slot="{ navigate, href }" :to="resume.to" custom>
          <Button as="a" :href="href" icon="pi pi-play" :label="`Продолжить: ${resume.label}`" @click="navigate" />
        </RouterLink>
        <RouterLink class="home-page__family" :to="{ name: ROUTE_NAMES.family }">
          <i class="pi pi-chart-bar" aria-hidden="true" /> Прогресс детей для родителей
        </RouterLink>
      </div>
    </section>

    <section class="home-page__grades" aria-labelledby="grades-title">
      <h2 id="grades-title" class="home-page__subtitle">Класс</h2>
      <SelectButton
        v-model="selectedGrade"
        :options="gradeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-labelledby="grades-title"
        class="home-page__grade-select"
      />
      <SubjectGrid :grade="selectedGrade" />
    </section>
  </div>
</template>

<style lang="sass" scoped>
@use './HomePage'
</style>
