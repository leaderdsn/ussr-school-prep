<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { PASS_SCORES, schoolMark, useProgressStore } from '@/entities/progress'
import { accentValue, ERA_LABELS, findGrade, gradeId, SubjectIcon, subjectTheme, SUBJECTS } from '@/entities/subject'
import { ROUTE_NAMES } from '@/shared/config'

import type { GradeNumber } from '@/entities/subject'

const { grade } = defineProps<{ grade: GradeNumber }>()

const progress = useProgressStore()

const cards = computed(() =>
  SUBJECTS.filter((subject) => subject.grades.includes(grade)).map((subject) => {
    const id = gradeId(subject.id, grade)
    const summary = findGrade(id)?.grade ?? null
    const state = progress.getGrade(id)
    const theme = subjectTheme(subject)
    return {
      id,
      subject,
      icon: theme.icon,
      style: { '--subject-accent': accentValue(theme) },
      summary,
      description: subject.gradeDescriptions[`${grade}`] ?? subject.description,
      seen: summary ? Math.min(state.seenTopics.length, summary.topicTitles.length) : 0,
      test: state.test.bestScore,
      testPassed: (state.test.bestScore ?? 0) >= PASS_SCORES.test,
      mark: state.control.bestScore === null ? null : schoolMark(state.control.bestScore),
    }
  }),
)
</script>

<template>
  <ul v-if="cards.length" class="subject-grid">
    <li
      v-for="card in cards"
      :key="card.id"
      class="subject-card"
      :class="[`subject-card--${card.subject.era}`, { 'subject-card--empty': !card.summary }]"
      :style="card.style"
    >
      <component
        :is="card.summary ? RouterLink : 'div'"
        class="subject-card__body"
        v-bind="card.summary ? { to: { name: ROUTE_NAMES.grade, params: { gradeId: card.id } } } : {}"
        :data-grade="card.id"
      >
        <span class="subject-card__head">
          <span class="subject-card__title">
            <SubjectIcon class="subject-card__icon" :icon="card.icon" />
            {{ card.subject.title }}
          </span>
          <span class="subject-card__era" :class="`subject-card__era--${card.subject.era}`">
            {{ card.subject.era === 'ussr' ? 'СССР' : 'РФ' }}
            <span class="visually-hidden">— {{ ERA_LABELS[card.subject.era] }}</span>
          </span>
        </span>
        <span class="subject-card__description">{{ card.description }}</span>

        <span v-if="card.summary" class="subject-card__status">
          <span class="subject-card__topics">{{ card.seen }}/{{ card.summary.topicTitles.length }} тем</span>
          <span v-if="card.test !== null" class="pill" :class="card.testPassed ? 'pill--good' : 'pill--bad'">
            <span class="visually-hidden">Лучший результат теста:</span>
            тест {{ card.test }}%
          </span>
          <span v-if="card.mark !== null" class="pill" :class="card.mark >= 3 ? 'pill--good' : 'pill--bad'">
            <span class="visually-hidden">Лучшая оценка за контрольную:</span>
            контрольная <span class="pill__mark">{{ card.mark }}</span>
          </span>
        </span>
        <span v-else class="subject-card__soon">Материал готовится</span>
      </component>
    </li>
  </ul>
  <p v-else class="subject-grid__empty">В этом классе пока нет предметов.</p>
</template>

<style lang="sass" scoped>
@use './SubjectGrid'
</style>
