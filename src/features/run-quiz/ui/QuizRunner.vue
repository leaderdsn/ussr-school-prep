<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'

import { PASS_SCORES, useProgressStore } from '@/entities/progress'

import { createQuizSession, isAnswered, isQuestionCorrect, scoreQuiz } from '../model/quiz'

import type { Grade, QuizQuestion } from '@/entities/subject'

import type { QuizAnswers, QuizResult } from '../model/quiz'

const { grade } = defineProps<{ grade: Grade }>()

const emit = defineEmits<{
  'review-topic': [topicIndex: number]
}>()

const TYPE_LABELS = { theory: 'Теория', practice: 'Практика' } as const
const KIND_HINTS = {
  single: 'Выберите один ответ',
  multiple: 'Выберите все верные ответы',
  input: 'Впишите ответ',
} as const
const PASS_SCORE = PASS_SCORES.test

const progress = useProgressStore()

const session = ref(createQuizSession(grade.quiz))
const answers = ref<QuizAnswers>({})
const result = ref<QuizResult | null>(null)
const warnedUnanswered = ref(false)
const resultRef = useTemplateRef<HTMLElement>('resultRef')

const items = computed(() => session.value.map((item) => ({ ...item, question: grade.quiz[item.questionIndex]! })))
const unansweredCount = computed(() => grade.quiz.filter((_, index) => !isAnswered(answers.value[index])).length)
const passed = computed(() => (result.value?.percent ?? 0) >= PASS_SCORE)
const checked = computed(() => result.value !== null)

watch(() => grade.id, restart)

function setAnswer(questionIndex: number, value: QuizAnswers[number]) {
  if (checked.value) return
  answers.value = { ...answers.value, [questionIndex]: value }
  warnedUnanswered.value = false
}

function toggleOption(questionIndex: number, optionIndex: number) {
  const current = answers.value[questionIndex]
  const selected = Array.isArray(current) ? current : []
  setAnswer(
    questionIndex,
    selected.includes(optionIndex) ? selected.filter((i) => i !== optionIndex) : [...selected, optionIndex],
  )
}

function isSelected(questionIndex: number, optionIndex: number): boolean {
  const answer = answers.value[questionIndex]
  return Array.isArray(answer) ? answer.includes(optionIndex) : answer === optionIndex
}

function textAnswer(questionIndex: number): string {
  const answer = answers.value[questionIndex]
  return typeof answer === 'string' ? answer : ''
}

async function check() {
  if (unansweredCount.value > 0 && !warnedUnanswered.value) {
    warnedUnanswered.value = true
    return
  }
  result.value = scoreQuiz(grade.quiz, answers.value)
  progress.recordResult(grade.id, 'test', result.value.percent)
  await nextTick()
  resultRef.value?.focus()
}

function restart() {
  session.value = createQuizSession(grade.quiz)
  answers.value = {}
  result.value = null
  warnedUnanswered.value = false
  window.scrollTo?.({ top: 0 })
}

function isRightOption(question: QuizQuestion, optionIndex: number): boolean {
  if (question.kind === 'single') return question.answer === optionIndex
  if (question.kind === 'multiple') return question.answers.includes(optionIndex)
  return false
}

function optionState(questionIndex: number, optionIndex: number): 'right' | 'wrong' | null {
  const question = grade.quiz[questionIndex]
  if (!checked.value || !question) return null
  if (isRightOption(question, optionIndex)) return 'right'
  return isSelected(questionIndex, optionIndex) ? 'wrong' : null
}

function isCorrect(questionIndex: number) {
  const question = grade.quiz[questionIndex]
  return question ? isQuestionCorrect(question, answers.value[questionIndex]) : false
}
</script>

<template>
  <div class="quiz-runner">
    <p class="quiz-runner__intro">
      {{ grade.quiz.length }} вопросов · для зачёта нужно {{ PASS_SCORE }}% · порядок каждый раз меняется
    </p>

    <section
      v-if="result"
      ref="resultRef"
      class="quiz-result"
      :class="passed ? 'quiz-result--passed' : 'quiz-result--failed'"
      tabindex="-1"
      aria-labelledby="quiz-result-title"
    >
      <h2 id="quiz-result-title" class="quiz-result__title">
        <i :class="passed ? 'pi pi-check-circle' : 'pi pi-info-circle'" aria-hidden="true" />
        {{ passed ? 'Тест сдан' : 'Пока не зачёт' }}
      </h2>
      <p class="quiz-result__score">
        <strong>{{ result.percent }}%</strong>
        <span>{{ result.correct }} из {{ result.total }} верно</span>
      </p>
      <ul class="quiz-result__split">
        <li>Теория: {{ result.byType.theory.correct }}/{{ result.byType.theory.total }}</li>
        <li>Практика: {{ result.byType.practice.correct }}/{{ result.byType.practice.total }}</li>
      </ul>
      <p class="quiz-result__hint">
        {{ passed ? 'Отличный результат. Можно переходить к контрольной работе.' : 'Разберите ошибки ниже, перечитайте темы и попробуйте ещё раз.' }}
      </p>
      <Button label="Пройти заново" icon="pi pi-refresh" severity="secondary" @click="restart" />
    </section>

    <ol class="quiz-runner__list">
      <li v-for="(item, position) in items" :key="item.questionIndex" class="question" :data-question="position">
        <fieldset class="question__fieldset" :class="{ 'question__fieldset--checked': checked }">
          <legend class="question__legend">
            <span class="question__number">{{ position + 1 }} / {{ items.length }}</span>
            <span class="question__tag" :class="`question__tag--${item.question.type}`">{{ TYPE_LABELS[item.question.type] }}</span>
            <span v-if="checked" class="question__verdict" :class="isCorrect(item.questionIndex) ? 'is-right' : 'is-wrong'">
              <i :class="isCorrect(item.questionIndex) ? 'pi pi-check' : 'pi pi-times'" aria-hidden="true" />
              {{ isCorrect(item.questionIndex) ? 'Верно' : isAnswered(answers[item.questionIndex]) ? 'Неверно' : 'Нет ответа' }}
            </span>
          </legend>

          <p class="question__text">{{ item.question.question }}</p>
          <p class="question__hint">{{ KIND_HINTS[item.question.kind] }}</p>

          <div v-if="item.question.kind === 'input'" class="question__input">
            <InputText
              :model-value="textAnswer(item.questionIndex)"
              :disabled="checked"
              :aria-label="`Ответ на вопрос ${position + 1}`"
              :invalid="checked && !isCorrect(item.questionIndex)"
              autocomplete="off"
              @update:model-value="setAnswer(item.questionIndex, $event ?? '')"
            />
            <p v-if="checked && !isCorrect(item.questionIndex)" class="question__expected">
              <i class="pi pi-check" aria-hidden="true" /> Правильный ответ: {{ item.question.answers[0] }}
            </p>
          </div>

          <div v-else class="question__options">
            <label
              v-for="optionIndex in item.optionOrder"
              :key="optionIndex"
              class="option"
              :class="[optionState(item.questionIndex, optionIndex), `option--${item.question.kind}`]"
            >
              <input
                class="option__input"
                :type="item.question.kind === 'multiple' ? 'checkbox' : 'radio'"
                :name="`q-${item.questionIndex}`"
                :value="optionIndex"
                :checked="isSelected(item.questionIndex, optionIndex)"
                :disabled="checked"
                @change="item.question.kind === 'multiple' ? toggleOption(item.questionIndex, optionIndex) : setAnswer(item.questionIndex, optionIndex)"
              >
              <span class="option__box">
                <span class="option__text">{{ item.question.options[optionIndex] }}</span>
                <span v-if="optionState(item.questionIndex, optionIndex) === 'right'" class="option__mark">
                  <i class="pi pi-check" aria-hidden="true" /> Правильный ответ
                </span>
                <span v-else-if="optionState(item.questionIndex, optionIndex) === 'wrong'" class="option__mark">
                  <i class="pi pi-times" aria-hidden="true" /> Ваш ответ
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div v-if="checked" class="question__explain">
          <p>{{ item.question.explanation }}</p>
          <button type="button" class="question__review" @click="emit('review-topic', item.question.topic)">
            Перечитать тему
          </button>
        </div>
      </li>
    </ol>

    <div v-if="!checked" class="quiz-runner__actions">
      <p v-if="warnedUnanswered" class="quiz-runner__warn" role="alert">
        <i class="pi pi-exclamation-triangle" aria-hidden="true" />
        Без ответа осталось вопросов: {{ unansweredCount }}. Они засчитаются как неверные. Нажмите ещё раз, чтобы проверить.
      </p>
      <Button label="Проверить" icon="pi pi-check" @click="check" />
    </div>
    <div v-else class="quiz-runner__actions">
      <Button label="Пройти заново" icon="pi pi-refresh" severity="secondary" @click="restart" />
    </div>
  </div>
</template>

<style lang="sass" scoped>
@use './QuizRunner'
</style>
