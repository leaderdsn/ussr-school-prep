<script setup lang="ts">
import { ref } from 'vue'

import { useProgressStore } from '@/entities/progress'
import { ROUTE_NAMES } from '@/shared/config'

import PioneerTieIcon from './PioneerTieIcon.vue'

const progress = useProgressStore()

const popover = ref<{ toggle: (event: Event) => void; hide: () => void } | null>(null)

function choose(childId: string) {
  progress.selectChild(childId)
  popover.value?.hide()
}
</script>

<template>
  <Button
    class="child-switcher"
    :label="progress.activeChild.name"
    :aria-label="`Занимается: ${progress.activeChild.name}. Сменить профиль`"
    severity="secondary"
    variant="text"
    aria-haspopup="dialog"
    @click="popover?.toggle($event)"
  >
    <template #icon>
      <PioneerTieIcon />
    </template>
  </Button>

  <Popover ref="popover">
    <div class="child-panel">
      <p class="child-panel__title">Кто занимается?</p>
      <ul class="child-panel__list">
        <li v-for="child in progress.children" :key="child.id">
          <button
            type="button"
            class="child-panel__item"
            :class="{ 'child-panel__item--active': child.id === progress.activeChildId }"
            :aria-pressed="child.id === progress.activeChildId"
            @click="choose(child.id)"
          >
            <i v-if="child.id === progress.activeChildId" class="pi pi-check-circle" aria-hidden="true" />
            <PioneerTieIcon v-else />
            {{ child.name }}
          </button>
        </li>
      </ul>
      <RouterLink class="child-panel__link" :to="{ name: ROUTE_NAMES.family }" @click="popover?.hide()">
        <i class="pi pi-chart-bar" aria-hidden="true" />
        Профили и прогресс детей
      </RouterLink>
    </div>
  </Popover>
</template>

<style lang="sass" scoped>
@use './ChildSwitcher'
</style>
