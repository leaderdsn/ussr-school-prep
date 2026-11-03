<script setup lang="ts">
import { useSyncStore } from '@/features/sync-progress'
import { useThemeStore } from '@/features/toggle-theme'
import { useActivityTracker } from '@/features/track-activity'
import { APP_VERSION, env, ROUTE_NAMES } from '@/shared/config'
import { AppHeader } from '@/widgets/app-header'

// Initializes theme (reads saved choice and applies the dark-mode class) before first paint.
useThemeStore()
// Restores the sync session of a parent who signed in earlier; loads Firebase only for them.
useSyncStore().init()
// Counts study time of the active child.
useActivityTracker()
</script>

<template>
  <AppHeader />
  <main class="app-main">
    <RouterView />
  </main>
  <footer class="app-footer">
    <span>{{ env.appTitle }} · v{{ APP_VERSION }}</span>
    <span>Объяснения написаны по программе и логике учебников, тексты учебников не копируются</span>
    <RouterLink class="app-footer__link" :to="{ name: ROUTE_NAMES.admin }">Редактор</RouterLink>
  </footer>
</template>

<style lang="sass" scoped>
@use './App'
</style>
