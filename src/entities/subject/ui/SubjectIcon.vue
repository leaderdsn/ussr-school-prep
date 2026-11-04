<script setup lang="ts">
// Emblem of a subject: a PrimeIcons class ("pi pi-book") or one of the drawn icons below ("svg:algebra").
// Drawn icons use currentColor and 1em size, so they behave like the icon font.
const { icon } = defineProps<{ icon: string }>()
</script>

<template>
  <svg
    v-if="icon === 'svg:algebra'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="32"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- a book with √2 on the cover and a bookmark -->
    <path d="M272 16H96C68 16 48 36 48 64v314" />
    <path d="M400 224v104H96c-26 0-48 22-48 50s22 50 48 50h40M280 428h120V328" />
    <path d="M112 378h192" />
    <path d="M152 378v100l58-44 58 44V378" />
    <path d="M240 72l48 72 64-128h128" />
    <path d="M370 84c0-22 16-36 36-36s36 14 36 34c0 34-72 50-72 92h72" />
  </svg>
  <i v-else class="subject-icon" :class="icon" aria-hidden="true" />
</template>

<style lang="sass" scoped>
svg.subject-icon
  width: 1em
  height: 1em
  vertical-align: -0.125em
</style>
