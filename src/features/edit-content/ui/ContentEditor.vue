<script setup lang="ts">
import { computed, ref } from 'vue'

import { overrideIssues, SUBJECTS } from '@/entities/subject'
import { downloadFile } from '@/shared/lib'

import { useAdminStore } from '../model/adminStore'
import { createQuestion, createTask } from '../model/draft'

import QuestionEditor from './QuestionEditor.vue'
import TaskEditor from './TaskEditor.vue'

import type { ControlTask, Grade, GradeOverride, QuizQuestion } from '@/entities/subject'

const { grade, override } = defineProps<{
  /** The grade as bundled with the app. */
  grade: Grade
  /** The current edit in the database, if any. */
  override: GradeOverride | null
}>()

const emit = defineEmits<{
  changed: []
}>()

const admin = useAdminStore()

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const saved = () => ({ quiz: override?.quiz ?? grade.quiz, control: override?.control ?? grade.control })
const quiz = ref<QuizQuestion[]>(clone(saved().quiz))
const control = ref<ControlTask[]>(clone(saved().control))

const tab = ref<'quiz' | 'control'>('quiz')
const tabOptions = [
  { value: 'quiz', label: 'Тест' },
  { value: 'control', label: 'Контрольная' },
]

const status = ref<{ severity: 'success' | 'error'; text: string } | null>(null)
const busy = ref(false)

const topicTitles = computed(() => grade.topics.map((topic) => topic.title))
const issues = computed(() => overrideIssues(grade, { quiz: quiz.value, control: control.value }, SUBJECTS))
const dirty = computed(() => JSON.stringify({ quiz: quiz.value, control: control.value }) !== JSON.stringify(saved()))
const totalPoints = computed(() => control.value.reduce((sum, task) => sum + task.points, 0))

function removeQuestion(index: number) {
  if (window.confirm('Удалить вопрос? Номера следующих вопросов сдвинутся, и в старых ошибках детей покажутся другие вопросы.')) {
    quiz.value = quiz.value.filter((_, i) => i !== index)
  }
}

function removeTask(index: number) {
  if (window.confirm('Удалить задание? Номера следующих заданий сдвинутся, и в старых ошибках детей покажутся другие задания.')) {
    control.value = control.value.filter((_, i) => i !== index)
  }
}

function discard() {
  quiz.value = clone(saved().quiz)
  control.value = clone(saved().control)
  status.value = null
}

async function run(action: () => Promise<void>, done: string) {
  busy.value = true
  status.value = null
  try {
    await action()
    status.value = { severity: 'success', text: done }
    emit('changed')
  } catch (cause) {
    status.value = { severity: 'error', text: cause instanceof Error ? cause.message : 'Не удалось сохранить' }
  } finally {
    busy.value = false
  }
}

function save() {
  return run(() => admin.save(grade.id, quiz.value, control.value), 'Сохранено: ученики увидят изменения при следующем открытии класса')
}

function reset() {
  if (!window.confirm('Вернуть тест и контрольную к версии из учебника? Правки в базе будут удалены.')) return
  return run(() => admin.reset(grade.id), 'Возвращена исходная версия')
}

function download() {
  const file = { ...grade, quiz: quiz.value, control: control.value }
  downloadFile(`${grade.id}.json`, `${JSON.stringify(file, null, 2)}\n`)
}
</script>

<template>
  <div class="content-editor">
    <div class="content-editor__bar">
      <SelectButton v-model="tab" :options="tabOptions" option-label="label" option-value="value" :allow-empty="false" />
      <span class="content-editor__meta">
        {{ quiz.length }} вопросов · {{ control.length }} заданий · {{ totalPoints }} баллов
        <template v-if="override"> · правка от {{ new Date(override.updatedAt).toLocaleString('ru-RU') }} ({{ override.updatedBy }})</template>
      </span>
    </div>

    <Message severity="warn" size="small">
      Не меняйте порядок и не удаляйте вопросы без необходимости: история ошибок детей ссылается на их номера.
      Новые вопросы добавляются в конец.
    </Message>

    <div v-if="tab === 'quiz'" class="content-editor__list">
      <QuestionEditor
        v-for="(_, index) in quiz"
        :key="index"
        v-model="quiz[index]!"
        :index="index"
        :topic-titles="topicTitles"
        @remove="removeQuestion(index)"
      />
      <Button label="Добавить вопрос" icon="pi pi-plus" severity="secondary" @click="quiz = [...quiz, createQuestion()]" />
    </div>

    <div v-else class="content-editor__list">
      <TaskEditor
        v-for="(_, index) in control"
        :key="index"
        v-model="control[index]!"
        :index="index"
        :topic-titles="topicTitles"
        @remove="removeTask(index)"
      />
      <Button label="Добавить задание" icon="pi pi-plus" severity="secondary" @click="control = [...control, createTask()]" />
    </div>

    <section class="content-editor__footer" aria-label="Сохранение">
      <ul v-if="issues.length" class="content-editor__issues" role="alert">
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
      <Message v-if="status" :severity="status.severity" size="small" closable @close="status = null">{{ status.text }}</Message>
      <div class="content-editor__actions">
        <Button label="Сохранить для всех" icon="pi pi-save" :loading="busy" :disabled="!dirty || issues.length > 0" @click="save" />
        <Button label="Отменить изменения" severity="secondary" variant="outlined" :disabled="!dirty" @click="discard" />
        <Button label="Скачать JSON класса" icon="pi pi-download" severity="secondary" variant="text" @click="download" />
        <Button v-if="override" label="Вернуть исходную версию" icon="pi pi-undo" severity="danger" variant="text" :disabled="busy" @click="reset" />
      </div>
    </section>
  </div>
</template>

<style lang="sass" scoped>
@use './ContentEditor'
</style>
