<script setup lang="ts">
import { computed } from 'vue'

import { CONTROL_STEP, ROUTE_NAMES, TEST_STEP } from '@/shared/config'

import type { GradeStep } from '@/shared/config'

const { gradeId, testPassed, controlPassed } = defineProps<{
  gradeId: string
  titles: readonly string[]
  seenTopics: readonly number[]
  step: GradeStep
  testPassed: boolean
  controlPassed: boolean
}>()

const finalSteps = computed((): { step: GradeStep; title: string; icon: string; done: boolean }[] => [
  { step: TEST_STEP, title: 'Тест', icon: 'pi pi-list-check', done: testPassed },
  { step: CONTROL_STEP, title: 'Контрольная работа', icon: 'pi pi-pencil', done: controlPassed },
])

function stepLink(step: GradeStep) {
  return { name: ROUTE_NAMES.grade, params: { gradeId, step: String(step) } }
}
</script>

<template>
  <nav class="grade-rail" aria-label="Шаги класса">
    <ol class="grade-rail__list">
      <li v-for="(title, index) in titles" :key="index">
        <RouterLink
          class="rail-step"
          :class="{ 'rail-step--active': step === index + 1, 'rail-step--done': seenTopics.includes(index) }"
          :to="stepLink(index + 1)"
          :aria-current="step === index + 1 ? 'step' : undefined"
        >
          <span class="rail-step__num" aria-hidden="true">
            <i v-if="seenTopics.includes(index) && step !== index + 1" class="pi pi-check" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="rail-step__title">{{ title }}</span>
          <span v-if="seenTopics.includes(index)" class="rail-step__sr">прочитано</span>
        </RouterLink>
      </li>
      <li v-for="item in finalSteps" :key="item.step">
        <RouterLink
          class="rail-step rail-step--final"
          :class="{ 'rail-step--active': step === item.step, 'rail-step--done': item.done }"
          :to="stepLink(item.step)"
          :aria-current="step === item.step ? 'step' : undefined"
        >
          <span class="rail-step__num" aria-hidden="true">
            <i :class="item.done && step !== item.step ? 'pi pi-check' : item.icon" />
          </span>
          <span class="rail-step__title">{{ item.title }}</span>
          <span v-if="item.done" class="rail-step__sr">сдано</span>
        </RouterLink>
      </li>
    </ol>
  </nav>
</template>

<style lang="sass" scoped>
@use './GradeRail'
</style>
