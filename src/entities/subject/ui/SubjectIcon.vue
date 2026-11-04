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
  <svg
    v-else-if="icon === 'svg:russian'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="28"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- a pencil writing a line -->
    <g transform="rotate(-45 256 236)">
      <path d="M170 196h230a40 40 0 0 1 0 80H170z" />
      <path d="M372 196v80M396 196v80" stroke-width="18" />
      <path d="M170 196l-80 40 80 40" />
      <path d="M170 196v80" stroke-width="18" />
      <path d="M118 222 90 236l28 14z" fill="currentColor" stroke-width="10" />
    </g>
    <path d="M100 440c20-36 44-8 62-2s34-30 56-18 30 18 54 12 54-8 84-12" />
  </svg>
  <svg
    v-else-if="icon === 'svg:literature'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="24"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- a scroll, a quill and an inkwell -->
    <path d="M132 36h276a28 28 0 0 1 0 56H132a28 28 0 0 1 0-56z" />
    <path d="M132 64h28" stroke-width="18" />
    <path d="M160 92v296M408 92v322" />
    <path d="M232 414h176a28 28 0 0 1 0 56H232" />
    <path d="M408 442h-24" stroke-width="18" />
    <path d="M200 376C204 250 296 146 448 100 424 232 336 320 226 368z" />
    <path d="M124 456 428 116" stroke-width="16" />
    <path d="M78 432h100v54H78z" fill="currentColor" />
    <path d="M104 406h48v26h-48z" fill="currentColor" />
  </svg>
  <svg
    v-else-if="icon === 'svg:reading'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="24"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- a book with АБВ on the cover -->
    <path d="M128 150 416 132v334l-266 22z" />
    <path d="M128 150 92 128l22 340 36 20" />
    <path d="M92 128c10-24 30-30 50-24" />
    <path d="M142 128 340 58l50 52M128 150 362 86l54 46M166 116 352 70" stroke-width="16" />
    <text x="272" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="118" font-weight="700" fill="currentColor" stroke="none">АБВ</text>
  </svg>
  <svg
    v-else-if="icon === 'svg:chemistry'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="24"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- test tubes in a rack, a flask and a molecule -->
    <path d="M84 196v204a26 26 0 0 0 52 0V196M164 196v204a26 26 0 0 0 52 0V196M70 196h80M150 196h80" />
    <path d="M84 330h52M164 300h52" stroke-width="16" />
    <path d="M52 270h196M60 486h188" />
    <path d="M354 180v118L278 448a22 22 0 0 0 20 32h188a22 22 0 0 0 20-32L430 298V180M338 180h108" />
    <path d="M306 404h172" stroke-width="16" />
    <circle cx="214" cy="84" r="22" />
    <circle cx="314" cy="56" r="22" />
    <circle cx="326" cy="132" r="22" />
    <path d="M235 77l58-14M234 96l70 28" stroke-width="16" />
  </svg>
  <svg
    v-else-if="icon === 'svg:physics'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="24"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- an atom -->
    <ellipse cx="256" cy="256" rx="96" ry="236" />
    <g transform="rotate(60 256 256)">
      <ellipse cx="256" cy="256" rx="96" ry="236" />
      <circle cx="256" cy="20" r="20" fill="currentColor" />
    </g>
    <g transform="rotate(-60 256 256)">
      <ellipse cx="256" cy="256" rx="96" ry="236" />
      <circle cx="256" cy="492" r="20" fill="currentColor" />
    </g>
    <circle cx="352" cy="256" r="20" fill="currentColor" />
    <circle cx="256" cy="256" r="46" />
  </svg>
  <svg
    v-else-if="icon === 'svg:astronomy'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="24"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- two ringed planets among the stars -->
    <circle cx="336" cy="336" r="100" />
    <path d="M250 290c40 10 110-20 150-80M244 360c60 10 140-30 176-100" stroke-width="18" />
    <ellipse cx="336" cy="336" rx="196" ry="58" transform="rotate(-40 336 336)" />
    <circle cx="96" cy="96" r="44" fill="currentColor" stroke="none" />
    <ellipse cx="96" cy="96" rx="80" ry="16" transform="rotate(40 96 96)" stroke-width="14" />
    <path d="M452 20v48M428 44h48M56 232v48M32 256h48" stroke-width="20" stroke-linecap="butt" />
    <path d="M208 72h16v16h-16zM296 24h16v16h-16zM240 168h16v16h-16zM152 240h16v16h-16zM120 296h16v16h-16zM472 320h16v16h-16zM480 416h16v16h-16zM88 456h16v16h-16zM424 480h16v16h-16z" fill="currentColor" stroke="none" />
    <circle cx="328" cy="104" r="16" fill="currentColor" stroke="none" />
    <circle cx="40" cy="384" r="16" fill="currentColor" stroke="none" />
  </svg>
  <svg
    v-else-if="icon === 'svg:social-studies'"
    class="subject-icon"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    stroke-width="24"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <!-- three people standing on the globe -->
    <circle cx="256" cy="64" r="40" />
    <circle cx="112" cy="112" r="34" />
    <circle cx="400" cy="112" r="34" />
    <path d="M200 270V140a18 18 0 0 1 18-18h76a18 18 0 0 1 18 18v130M256 196v76" />
    <path d="M64 330V180a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v14M112 230v76" />
    <path d="M448 330V180a16 16 0 0 0-16-16h-64a16 16 0 0 0-16 16v14M400 230v76" />
    <path d="M24 492a232 232 0 0 1 464 0z" />
    <path d="M96 444h72a18 18 0 0 0 0-36h-20a18 18 0 0 1 0-36h44M300 330h64a18 18 0 0 1 0 36h-22a18 18 0 0 0 0 36h80" stroke-width="18" />
    <path d="M270 448h28" stroke-width="22" />
  </svg>
  <i v-else class="subject-icon" :class="icon" aria-hidden="true" />
</template>

<style lang="sass" scoped>
svg.subject-icon
  width: 1em
  height: 1em
  vertical-align: -0.125em
</style>
