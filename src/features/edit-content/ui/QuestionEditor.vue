<script setup lang="ts">
import { computed } from 'vue'

import { changeKind, KIND_LABELS, linesToList, listToLines, removeOption } from '../model/draft'

import type { QuestionKind } from '../model/draft'
import type { QuizQuestion } from '@/entities/subject'

const { index, topicTitles } = defineProps<{ index: number; topicTitles: readonly string[] }>()

const emit = defineEmits<{
  remove: []
}>()

const question = defineModel<QuizQuestion>({ required: true })

const kindOptions = (Object.keys(KIND_LABELS) as QuestionKind[]).map((value) => ({ value, label: KIND_LABELS[value] }))
const typeOptions = [
  { value: 'theory', label: 'Теория' },
  { value: 'practice', label: 'Практика' },
]
const topicOptions = computed(() => topicTitles.map((title, i) => ({ value: i, label: `${i + 1}. ${title}` })))

function patch(fields: Partial<QuizQuestion>) {
  question.value = { ...question.value, ...fields } as QuizQuestion
}

function setOption(optionIndex: number, text: string) {
  const current = question.value
  if (current.kind === 'input') return
  patch({ options: current.options.map((option, i) => (i === optionIndex ? text : option)) })
}

function isCorrect(optionIndex: number): boolean {
  const current = question.value
  if (current.kind === 'single') return current.answer === optionIndex
  if (current.kind === 'multiple') return current.answers.includes(optionIndex)
  return false
}

function toggleCorrect(optionIndex: number) {
  const current = question.value
  if (current.kind === 'single') patch({ answer: optionIndex })
  if (current.kind === 'multiple') {
    const answers = current.answers.includes(optionIndex)
      ? current.answers.filter((i) => i !== optionIndex)
      : [...current.answers, optionIndex].sort((a, b) => a - b)
    patch({ answers })
  }
}

function addOption() {
  const current = question.value
  if (current.kind !== 'input') patch({ options: [...current.options, ''] })
}
</script>

<template>
  <fieldset class="editor-card">
    <legend class="editor-card__legend">Вопрос {{ index + 1 }}</legend>

    <div class="editor-card__row">
      <label class="editor-field">
        <span>Вид</span>
        <Select
          :model-value="question.kind"
          :options="kindOptions"
          option-label="label"
          option-value="value"
          @update:model-value="question = changeKind(question, $event)"
        />
      </label>
      <label class="editor-field">
        <span>Тип</span>
        <Select
          :model-value="question.type"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          @update:model-value="patch({ type: $event })"
        />
      </label>
      <label class="editor-field editor-field--wide">
        <span>Тема, где есть ответ</span>
        <Select
          :model-value="question.topic"
          :options="topicOptions"
          option-label="label"
          option-value="value"
          @update:model-value="patch({ topic: $event })"
        />
      </label>
    </div>

    <label class="editor-field">
      <span>Текст вопроса</span>
      <Textarea :model-value="question.question" auto-resize rows="2" @update:model-value="patch({ question: $event })" />
    </label>

    <div v-if="question.kind !== 'input'" class="editor-field">
      <span>Варианты — отметьте {{ question.kind === 'single' ? 'правильный' : 'все правильные' }}</span>
      <ul class="editor-options">
        <li v-for="(option, optionIndex) in question.options" :key="optionIndex" class="editor-options__item">
          <input
            :type="question.kind === 'single' ? 'radio' : 'checkbox'"
            :name="`correct-${index}`"
            :checked="isCorrect(optionIndex)"
            :aria-label="`Вариант ${optionIndex + 1} правильный`"
            @change="toggleCorrect(optionIndex)"
          >
          <InputText
            :model-value="option"
            :aria-label="`Вариант ${optionIndex + 1}`"
            fluid
            @update:model-value="setOption(optionIndex, $event ?? '')"
          />
          <Button
            icon="pi pi-times"
            severity="secondary"
            variant="text"
            size="small"
            :aria-label="`Удалить вариант ${optionIndex + 1}`"
            :disabled="question.options.length <= 2"
            @click="question = removeOption(question, optionIndex)"
          />
        </li>
      </ul>
      <Button label="Вариант" icon="pi pi-plus" severity="secondary" variant="text" size="small" @click="addOption" />
    </div>

    <label v-else class="editor-field">
      <span>Допустимые ответы — по одному в строке («10», «10 см», «на 10»)</span>
      <Textarea
        :model-value="listToLines(question.answers)"
        auto-resize
        rows="3"
        @update:model-value="patch({ answers: linesToList($event) })"
      />
    </label>

    <label class="editor-field">
      <span>Пояснение после проверки</span>
      <Textarea :model-value="question.explanation" auto-resize rows="2" @update:model-value="patch({ explanation: $event })" />
    </label>

    <Button label="Удалить вопрос" icon="pi pi-trash" severity="danger" variant="text" size="small" @click="emit('remove')" />
  </fieldset>
</template>

<style lang="sass" scoped>
@use './editor'
</style>
