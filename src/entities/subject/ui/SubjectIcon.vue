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
  <svg
    v-else-if="icon === 'svg:geometry'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="26"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- set square, pencil, eraser, protractor and ruler -->
    <path d="M96 24h392v392zM232 84h196v196z" />
    <path d="M60 24 24 60l160 160 60 24-24-60z" />
    <path d="M84 148 140 204 84 260 28 204z" />
    <path d="M50 416a160 160 0 0 1 320 0M114 416a96 96 0 0 1 192 0" />
    <path d="M24 416h368v80H24z" />
    <path stroke-width="20" d="M168 24v30M208 24v20M248 24v30M288 24v20M328 24v30M368 24v20M408 24v30M488 72h-30M488 112h-20M488 152h-30M488 192h-20M488 232h-30M488 272h-20M488 312h-30M488 352h-20M341 381L365 375M328 348L349 336M306 320L323 303M278 298L290 277M245 285L251 261M210 280L210 256M175 285L169 261M142 298L130 277M114 320L97 303M92 348L71 336M79 381L55 375M72 416v32M108 416v20M144 416v32M180 416v20M216 416v32M252 416v20M288 416v32M324 416v20M360 416v32" />
  </svg>
  <i v-else class="subject-icon" :class="icon" aria-hidden="true" />
</template>

<style lang="sass" scoped>
svg.subject-icon
  width: 1em
  height: 1em
  vertical-align: -0.125em
</style>
