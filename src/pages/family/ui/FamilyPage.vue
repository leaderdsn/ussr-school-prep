<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useProgressStore } from '@/entities/progress'
import { ManageChildren } from '@/features/manage-children'
import { ManageProgress } from '@/features/manage-progress'
import { SyncButton, useSyncStore } from '@/features/sync-progress'
import { ChildReport } from '@/widgets/child-report'

const progress = useProgressStore()
const sync = useSyncStore()

const selectedId = ref(progress.activeChildId)
const childOptions = computed(() => progress.children.map((child) => ({ value: child.id, label: child.name })))
const selected = computed(() => progress.children.find((child) => child.id === selectedId.value) ?? progress.activeChild)

// A removed profile falls back to the active one.
watch(
  () => progress.children.map((child) => child.id),
  (ids) => {
    if (!selectedId.value || !ids.includes(selectedId.value)) selectedId.value = progress.activeChildId
  },
)
</script>

<template>
  <div class="family-page">
    <header class="family-page__head">
      <h1 class="family-page__title">Прогресс детей</h1>
      <p class="family-page__lead">Сводка по классам, история попыток, ошибки и время занятий каждого ребёнка.</p>
      <p v-if="sync.available && !sync.user" class="family-page__sync">
        <i class="pi pi-info-circle" aria-hidden="true" />
        Сейчас виден только прогресс на этом устройстве. Войдите через Google здесь и на устройствах детей, чтобы
        видеть всё вместе.
        <SyncButton />
      </p>
      <p v-else-if="!sync.available" class="family-page__sync">
        <i class="pi pi-info-circle" aria-hidden="true" />
        Прогресс хранится в этом браузере. Чтобы перенести его на другое устройство, сохраните файл внизу страницы.
      </p>
    </header>

    <section class="family-page__report" aria-labelledby="report-title">
      <div class="family-page__report-head">
        <h2 id="report-title" class="family-page__subtitle">{{ selected.name }}</h2>
        <SelectButton
          v-if="childOptions.length > 1"
          v-model="selectedId"
          :options="childOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          aria-label="Чей прогресс показать"
        />
      </div>
      <ChildReport :progress="progress.progressOf(selected.id)" />
    </section>

    <section class="family-page__section" aria-labelledby="children-title">
      <h2 id="children-title" class="family-page__subtitle">Профили</h2>
      <p class="family-page__hint">Ребёнок выбирает свой профиль кнопкой с именем в шапке — результаты записываются ему.</p>
      <ManageChildren />
    </section>

    <section class="family-page__section" aria-labelledby="file-title">
      <h2 id="file-title" class="family-page__subtitle">Файл с прогрессом</h2>
      <p class="family-page__hint">Все профили и их прогресс в одном файле: резервная копия или перенос без аккаунта.</p>
      <ManageProgress />
    </section>
  </div>
</template>

<style lang="sass" scoped>
@use './FamilyPage'
</style>
