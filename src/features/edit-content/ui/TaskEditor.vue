<script setup lang="ts">
import { computed } from 'vue'

import { checkHtml } from '@/entities/subject'

import { linesToList, listToLines } from '../model/draft'

import type { ControlTask } from '@/entities/subject'

const { index, topicTitles } = defineProps<{ index: number; topicTitles: readonly string[] }>()

const emit = defineEmits<{
  remove: []
}>()

const task = defineModel<ControlTask>({ required: true })

const solutionIssues = computed(() => checkHtml(task.value.solution, 'Разбор'))
const topicOptions = computed(() => topicTitles.map((title, i) => ({ value: i, label: `${i + 1}. ${title}` })))

function patch(fields: Partial<ControlTask>) {
  task.value = { ...task.value, ...fields }
}
</script>

<template>
  <fieldset class="editor-card">
    <legend class="editor-card__legend">Задание {{ index + 1 }}</legend>

    <div class="editor-card__row">
      <label class="editor-field editor-field--wide">
        <span>Тема</span>
        <Select
          :model-value="task.topic"
          :options="topicOptions"
          option-label="label"
          option-value="value"
          @update:model-value="patch({ topic: $event })"
        />
      </label>
      <label class="editor-field">
        <span>Баллы</span>
        <InputNumber
          :model-value="task.points"
          :min="1"
          :max="10"
          show-buttons
          @update:model-value="patch({ points: $event ?? 1 })"
        />
      </label>
    </div>

    <label class="editor-field">
      <span>Условие</span>
      <Textarea :model-value="task.text" auto-resize rows="2" @update:model-value="patch({ text: $event })" />
    </label>

    <label class="editor-field">
      <span>Допустимые ответы — по одному в строке</span>
      <Textarea
        :model-value="listToLines(task.answers)"
        auto-resize
        rows="3"
        @update:model-value="patch({ answers: linesToList($event) })"
      />
    </label>

    <label class="editor-field">
      <span>Разбор решения (HTML: p, b, i, классы formula, example…)</span>
      <Textarea :model-value="task.solution" auto-resize rows="4" class="editor-code" @update:model-value="patch({ solution: $event })" />
    </label>
    <div class="editor-preview">
      <span class="editor-preview__label">Так увидит ученик</span>
      <ul v-if="solutionIssues.length" class="editor-preview__issues">
        <li v-for="issue in solutionIssues" :key="issue">{{ issue }}</li>
      </ul>
      <!-- eslint-disable-next-line vue/no-v-html -- shown only after the content validator accepted it -->
      <div v-else class="content content--flow" v-html="task.solution" />
    </div>

    <Button label="Удалить задание" icon="pi pi-trash" severity="danger" variant="text" size="small" @click="emit('remove')" />
  </fieldset>
</template>

<style lang="sass" scoped>
@use './editor'
</style>
