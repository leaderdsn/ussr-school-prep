<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import { PASS_SCORES, useProgressStore } from '@/entities/progress'
import { withContentBase } from '@/entities/subject'

import { scoreControl } from '../model/control'

import type { Grade } from '@/entities/subject'

import type { ControlAnswers, ControlResult } from '../model/control'

const { grade } = defineProps<{ grade: Grade }>()

const emit = defineEmits<{
  'review-topic': [topicIndex: number]
}>()

const progress = useProgressStore()

const answers = ref<ControlAnswers>({})
const result = ref<ControlResult | null>(null)
const startedAt = ref(Date.now())
const warnedUnanswered = ref(false)
const resultRef = useTemplateRef<HTMLElement>('resultRef')

const maxPoints = computed(() => grade.control.reduce((sum, task) => sum + task.points, 0))
const unansweredCount = computed(() => grade.control.filter((_, index) => !answers.value[index]?.trim()).length)
const passed = computed(() => (result.value?.percent ?? 0) >= PASS_SCORES.control)
const checked = computed(() => result.value !== null)

watch(() => grade.id, restart)

function setAnswer(taskIndex: number, value: string) {
  if (checked.value) return
  answers.value = { ...answers.value, [taskIndex]: value }
  warnedUnanswered.value = false
}

async function submit() {
  if (unansweredCount.value > 0 && !warnedUnanswered.value) {
    warnedUnanswered.value = true
    return
  }
  result.value = scoreControl(grade.control, answers.value)
  const { solved, percent } = result.value
  progress.recordAttempt({
    gradeId: grade.id,
    kind: 'control',
    percent,
    durationSec: Math.round((Date.now() - startedAt.value) / 1000),
    mistakes: grade.control.flatMap((task, index) =>
      solved[index] ? [] : [{ index, topic: task.topic, given: answers.value[index]?.trim() ?? '' }],
    ),
  })
  await nextTick()
  resultRef.value?.focus()
}

function restart() {
  answers.value = {}
  result.value = null
  warnedUnanswered.value = false
  startedAt.value = Date.now()
  window.scrollTo?.({ top: 0 })
}

function pointsLabel(points: number): string {
  const mod10 = points % 10
  const mod100 = points % 100
  if (mod10 === 1 && mod100 !== 11) return `${points} балл`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${points} балла`
  return `${points} баллов`
}
</script>

<template>
  <div class="control-runner">
    <p class="control-runner__intro">
      {{ grade.control.length }} заданий · {{ pointsLabel(maxPoints) }} · оценка: 90% — «5», 70% — «4», 50% — «3».
      Решите задания в тетради и впишите ответы.
    </p>

    <section
      v-if="result"
      ref="resultRef"
      class="control-result"
      :class="passed ? 'control-result--passed' : 'control-result--failed'"
      tabindex="-1"
      aria-labelledby="control-result-title"
    >
      <h2 id="control-result-title" class="control-result__title">
        Оценка <span class="control-result__mark">{{ result.mark }}</span>
      </h2>
      <p class="control-result__score">
        {{ pointsLabel(result.points) }} из {{ result.maxPoints }} · {{ result.percent }}%
      </p>
      <p class="control-result__hint">
        {{ passed ? 'Работа зачтена. Разберите решения, чтобы закрепить материал.' : 'Работа не зачтена. Посмотрите решения, перечитайте темы и напишите контрольную ещё раз.' }}
      </p>
      <Button label="Написать заново" icon="pi pi-refresh" severity="secondary" @click="restart" />
    </section>

    <ol class="control-runner__list">
      <li v-for="(task, index) in grade.control" :key="index" class="task">
        <div class="task__card">
          <p class="task__head">
            <span class="task__number">Задание {{ index + 1 }}</span>
            <span class="task__points">{{ pointsLabel(task.points) }}</span>
            <span v-if="result" class="task__verdict" :class="result.solved[index] ? 'is-right' : 'is-wrong'">
              <i :class="result.solved[index] ? 'pi pi-check' : 'pi pi-times'" aria-hidden="true" />
              {{ result.solved[index] ? 'Верно' : answers[index]?.trim() ? 'Неверно' : 'Нет ответа' }}
            </span>
          </p>
          <p :id="`task-${index}`" class="task__text">{{ task.text }}</p>
          <InputText
            class="task__input"
            :model-value="answers[index] ?? ''"
            :disabled="checked"
            :invalid="result !== null && !result.solved[index]"
            :aria-labelledby="`task-${index}`"
            placeholder="Ответ"
            autocomplete="off"
            @update:model-value="setAnswer(index, $event ?? '')"
          />
        </div>

        <div v-if="checked" class="task__solution">
          <p class="task__solution-title">Решение</p>
          <!-- eslint-disable-next-line vue/no-v-html -- trusted HTML bundled with the app -->
          <div class="content content--flow" v-html="withContentBase(task.solution)" />
          <button type="button" class="task__review" @click="emit('review-topic', task.topic)">
            Перечитать тему
          </button>
        </div>
      </li>
    </ol>

    <div v-if="!checked" class="control-runner__actions">
      <p v-if="warnedUnanswered" class="control-runner__warn" role="alert">
        <i class="pi pi-exclamation-triangle" aria-hidden="true" />
        Без ответа осталось заданий: {{ unansweredCount }}. Они не принесут баллов. Нажмите ещё раз, чтобы сдать работу.
      </p>
      <Button label="Сдать работу" icon="pi pi-send" @click="submit" />
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use './ControlRunner'
</style>
