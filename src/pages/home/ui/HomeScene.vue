<script setup lang="ts">
// Decorative background of the home page: a blackboard and pupils in the Soviet school uniform.
// Pure decoration, hidden from assistive technology; the colours are fixed on purpose (uniform, wood, chalk).
</script>

<template>
  <div class="home-scene" aria-hidden="true">
    <svg class="home-scene__board" viewBox="0 0 320 200" focusable="false">
      <rect x="4" y="4" width="312" height="176" rx="6" fill="#8a5a33" />
      <rect x="14" y="14" width="292" height="156" rx="3" fill="#2f4b3c" />
      <rect x="14" y="14" width="292" height="156" rx="3" fill="none" stroke="#1d3228" stroke-width="2" />
      <rect x="22" y="176" width="276" height="9" rx="2" fill="#6f4624" />
      <rect x="60" y="173" width="26" height="4" rx="1" fill="#f4f1e6" />
      <rect x="92" y="174" width="14" height="3" rx="1" fill="#e9b8b0" />
      <g fill="#f4f1e6" font-family="Caveat, cursive" font-size="22">
        <text x="30" y="46" font-size="18" opacity=".85">1 сентября</text>
        <text x="30" y="82">2 + 3 = 5</text>
        <text x="30" y="112">a² + b² = c²</text>
        <text x="30" y="142">Мы пишем диктант</text>
      </g>
      <g fill="none" stroke="#f4f1e6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".85">
        <path d="M200 100v-34h56v34z" />
        <path d="M200 100l56-34" />
        <path d="M205 116h46M205 128h30" opacity=".7" />
      </g>
    </svg>

    <svg class="home-scene__girl" viewBox="0 0 120 240" focusable="false">
      <path d="M44 60c-14 14-14 46-8 70" fill="none" stroke="#5a3a22" stroke-width="9" stroke-linecap="round" />
      <path d="M76 60c14 14 14 46 8 70" fill="none" stroke="#5a3a22" stroke-width="9" stroke-linecap="round" />
      <ellipse cx="60" cy="48" rx="24" ry="26" fill="#f1cfae" />
      <path d="M36 46c0-20 12-28 24-28s24 8 24 28c-6-12-14-16-24-16s-18 4-24 16z" fill="#5a3a22" />
      <path d="M32 60l-9-6 2 14zM28 63l8-3-4 11z" fill="#fff" />
      <path d="M88 60l9-6-2 14zM92 63l-8-3 4 11z" fill="#fff" />
      <circle cx="51" cy="50" r="2" fill="#2a1d14" />
      <circle cx="69" cy="50" r="2" fill="#2a1d14" />
      <path d="M53 60q7 5 14 0" fill="none" stroke="#a24a3a" stroke-width="2" stroke-linecap="round" />
      <path d="M32 82h56l10 74H22z" fill="#6b3d22" />
      <path d="M44 74l16 16 16-16-8-4h-16z" fill="#fff" />
      <path d="M40 92h40l8 64H32z" fill="#1f1f24" />
      <path d="M44 92l-2-18M76 92l2-18" stroke="#1f1f24" stroke-width="5" />
      <rect x="24" y="86" width="14" height="52" rx="7" fill="#6b3d22" />
      <rect x="82" y="86" width="14" height="52" rx="7" fill="#6b3d22" />
      <circle cx="31" cy="142" r="7" fill="#f1cfae" />
      <circle cx="89" cy="142" r="7" fill="#f1cfae" />
      <path d="M22 156h76l4 14H18z" fill="#6b3d22" />
      <rect x="44" y="170" width="12" height="46" fill="#f1cfae" />
      <rect x="64" y="170" width="12" height="46" fill="#f1cfae" />
      <rect x="42" y="196" width="16" height="22" fill="#fff" />
      <rect x="62" y="196" width="16" height="22" fill="#fff" />
      <path d="M38 218h24v10H34zM58 218h24l4 10H56z" fill="#1f1f24" />
    </svg>

    <svg class="home-scene__boy" viewBox="0 0 120 240" focusable="false">
      <ellipse cx="60" cy="52" rx="23" ry="25" fill="#f1cfae" />
      <path d="M36 44c0-14 10-22 24-22s24 8 24 22z" fill="#3a4a68" />
      <path d="M30 44h60l-4 6H34z" fill="#2c3a54" />
      <circle cx="60" cy="34" r="4" fill="#e1b84a" />
      <path d="M38 52c0 4 0 8 2 12M82 52c0 4 0 8-2 12" stroke="#7a5a3a" stroke-width="6" stroke-linecap="round" fill="none" />
      <circle cx="51" cy="54" r="2" fill="#2a1d14" />
      <circle cx="69" cy="54" r="2" fill="#2a1d14" />
      <path d="M53 64q7 5 14 0" fill="none" stroke="#a24a3a" stroke-width="2" stroke-linecap="round" />
      <path d="M32 82h56l8 78H24z" fill="#4a5b78" />
      <path d="M50 78h20l-10 10z" fill="#fff" />
      <path d="M60 88v70" stroke="#33415c" stroke-width="2" />
      <g fill="#e1b84a">
        <circle cx="60" cy="100" r="2.2" />
        <circle cx="60" cy="116" r="2.2" />
        <circle cx="60" cy="132" r="2.2" />
      </g>
      <rect x="26" y="146" width="68" height="9" fill="#2a2a30" />
      <rect x="53" y="145" width="14" height="11" rx="2" fill="#e1b84a" />
      <rect x="22" y="86" width="14" height="54" rx="7" fill="#4a5b78" />
      <rect x="84" y="86" width="14" height="54" rx="7" fill="#4a5b78" />
      <circle cx="29" cy="144" r="7" fill="#f1cfae" />
      <circle cx="91" cy="144" r="7" fill="#f1cfae" />
      <rect x="32" y="155" width="26" height="62" fill="#3a4a68" />
      <rect x="62" y="155" width="26" height="62" fill="#3a4a68" />
      <path d="M30 218h30v10H26zM60 218h30l4 10H60z" fill="#1f1f24" />
    </svg>
  </div>
</template>

<style lang="sass" scoped>
.home-scene
  position: fixed
  inset: 0
  z-index: -1
  display: none
  pointer-events: none

  @media (min-width: 64rem)
    display: block

  svg
    position: absolute
    height: auto

  &__board
    top: 5.5rem
    right: 1.5rem
    width: clamp(10rem, 18vw, 20rem)
    opacity: 0.92
    transform: rotate(2deg)

  &__girl
    bottom: 0
    left: 0.5rem
    width: clamp(5rem, 9vw, 8.5rem)
    opacity: 0.95

  &__boy
    right: 0.5rem
    bottom: 0
    width: clamp(5rem, 9vw, 8.5rem)
    opacity: 0.95
</style>
