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
    <p class="app-footer__credits">
      Фоновые изображения на главной — Wikimedia Commons:
      <a href="https://commons.wikimedia.org/wiki/File:Soviet_schoolgirl_in_Vladivostok.JPEG" rel="noopener" target="_blank">школьница во Владивостоке</a>
      (PH1 Ted Salois, общественное достояние);
      <a href="https://commons.wikimedia.org/wiki/File:СССР,_1986,_Ростов-на-Дону,_Юный_пионер,_Soviet_school,_Pioneer,_Soviet_Union.jpg" rel="noopener" target="_blank">юный пионер, 1986</a>
      (Vyacheslav Argenberg, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a>);
      марки Почты СССР
      <a href="https://commons.wikimedia.org/wiki/File:USSR_stamp_1952_CPA_1681.jpg" rel="noopener" target="_blank">1951</a> и
      <a href="https://commons.wikimedia.org/wiki/File:1972._Учеба_—_главный_труд_пионера.jpg" rel="noopener" target="_blank">1972</a>
      (общественное достояние).
    </p>
  </footer>
</template>

<style lang="sass" scoped>
@use './App'
</style>
