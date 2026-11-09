<script setup lang="ts">
import { ref, watch } from 'vue'

import { withContentBase } from '@/entities/subject'

import type { Exercise } from '@/entities/subject'

const { exercises, topicKey } = defineProps<{
  exercises: readonly Exercise[]
  /** Changes when another topic opens, so revealed answers are hidden again. */
  topicKey: string
}>()

const shown = ref<Set<number>>(new Set())

watch(
  () => topicKey,
  () => (shown.value = new Set()),
)

function toggle(index: number) {
  const next = new Set(shown.value)
  if (next.has(index)) next.delete(index)
  else next.add(index)
  shown.value = next
}
</script>

<template>
  <section class="exercises" aria-labelledby="exercises-title">
    <h3 id="exercises-title" class="exercises__title">
      <i class="pi pi-pencil" aria-hidden="true" />
      Выполни в тетради
    </h3>
    <p class="exercises__hint">Реши задания в тетради, а потом проверь себя.</p>
    <ol class="exercises__list">
      <li v-for="(exercise, index) in exercises" :key="index" class="exercise">
        <span class="exercise__number" aria-hidden="true">{{ index + 1 }}</span>
        <div class="exercise__body">
          <!-- eslint-disable-next-line vue/no-v-html -- trusted HTML bundled with the app -->
          <div class="content content--flow" v-html="withContentBase(exercise.text)" />
          <button
            type="button"
            class="exercise__toggle"
            :aria-expanded="shown.has(index)"
            @click="toggle(index)"
          >
            <i :class="shown.has(index) ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true" />
            {{ shown.has(index) ? 'Скрыть ответ' : 'Проверить себя' }}
          </button>
          <!-- eslint-disable-next-line vue/no-v-html -- trusted HTML bundled with the app -->
          <div v-if="shown.has(index)" class="exercise__answer content content--flow" v-html="withContentBase(exercise.answer)" />
        </div>
      </li>
    </ol>
  </section>
</template>

<style lang="sass" scoped>
@use './TopicExercises'
</style>
