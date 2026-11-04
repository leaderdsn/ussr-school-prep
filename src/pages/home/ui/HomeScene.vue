<script setup lang="ts">
// Decorative background of the home page: schoolchildren in the Soviet school uniform and a blackboard.
// Teleported to <body> as a fixed layer behind everything, so it stays put while the page scrolls.
// Pure decoration, hidden from assistive technology; the colours are fixed on purpose (uniform, chalk, wood).
</script>

<template>
  <Teleport to="body">
    <div class="home-scene" aria-hidden="true">
      <!-- A girl and a boy on their way to school -->
      <svg class="home-scene__pair" viewBox="0 0 270 310" focusable="false">
        <!-- girl -->
        <g>
          <rect x="14" y="214" width="44" height="34" rx="4" fill="#2f4a3a" />
          <rect x="14" y="214" width="44" height="7" rx="3" fill="#24382c" />
          <path d="M28 214v-6h16v6" fill="none" stroke="#24382c" stroke-width="3" />
          <path d="M44 128c-4 18-10 40-22 56" fill="none" stroke="#f3d2b3" stroke-width="11" stroke-linecap="round" />
          <circle cx="22" cy="190" r="7" fill="#f3d2b3" />
          <rect x="52" y="196" width="22" height="64" rx="10" fill="#f3d2b3" />
          <rect x="90" y="196" width="22" height="64" rx="10" fill="#f3d2b3" />
          <rect x="52" y="226" width="22" height="42" rx="3" fill="#fff" />
          <rect x="90" y="226" width="22" height="42" rx="3" fill="#fff" />
          <path d="M48 268h30l2 12H44zM88 268h30l6 12H86z" fill="#1c1c22" />
          <path d="M40 118c6-12 20-14 42-14s36 2 42 14l8 80H32z" fill="#5b3320" />
          <path d="M48 112c-12 0-22 8-24 22l6 24 20-6z" fill="#5b3320" />
          <path d="M120 112c12 0 22 8 24 22l-6 24-20-6z" fill="#5b3320" />
          <path d="M26 148h22l-3 12H29z" fill="#f4eee6" />
          <path d="M44 122c4-8 12-12 38-12s34 4 38 12l-6 78H50z" fill="#fbfaf6" />
          <path d="M40 124c-8-4-12 0-12 8 6 2 12 0 16-4zM124 124c8-4 12 0 12 8-6 2-12 0-16-4z" fill="#fbfaf6" />
          <path d="M44 128q-6 6-4 14M120 128q6 6 4 14" fill="none" stroke="#e5ddd0" stroke-width="2" />
          <path d="M52 198h60" stroke="#e5ddd0" stroke-width="3" />
          <rect x="68" y="92" width="26" height="22" fill="#f3d2b3" />
          <ellipse cx="81" cy="70" rx="29" ry="31" fill="#f3d2b3" />
          <path d="M52 66c0-24 14-36 29-36s29 12 29 36c-6-14-16-20-29-20s-23 6-29 20z" fill="#6a4023" />
          <circle cx="54" cy="84" r="9" fill="#6a4023" />
          <circle cx="108" cy="84" r="9" fill="#6a4023" />
          <path d="M50 40c-16-14-34-10-38-2 8 8 24 10 38 2z" fill="#fff" stroke="#e5ddd0" stroke-width="1.5" />
          <path d="M50 40c-14 10-30 20-36 12 4-10 22-14 36-12z" fill="#fff" stroke="#e5ddd0" stroke-width="1.5" />
          <circle cx="50" cy="42" r="5" fill="#f4eee6" />
          <path d="M112 40c16-14 34-10 38-2-8 8-24 10-38 2z" fill="#fff" stroke="#e5ddd0" stroke-width="1.5" />
          <path d="M112 40c14 10 30 20 36 12-4-10-22-14-36-12z" fill="#fff" stroke="#e5ddd0" stroke-width="1.5" />
          <circle cx="112" cy="42" r="5" fill="#f4eee6" />
          <circle cx="70" cy="72" r="2.6" fill="#2a1d14" />
          <circle cx="92" cy="72" r="2.6" fill="#2a1d14" />
          <circle cx="63" cy="82" r="5" fill="#ee9a8a" opacity=".55" />
          <circle cx="99" cy="82" r="5" fill="#ee9a8a" opacity=".55" />
          <path d="M72 84q9 8 18 0" fill="none" stroke="#b04a3a" stroke-width="2.4" stroke-linecap="round" />
          <path d="M60 112l21 10 21-10-8 6-13 6-13-6z" fill="#fff" />
          <path d="M62 108l19 10 19-10 6 8-25 12-25-12z" fill="#d42a2a" />
          <path d="M70 124l11 4-3 34-9-22zM92 124l-11 4 3 34 9-22z" fill="#c42222" />
          <circle cx="81" cy="124" r="5" fill="#b01e1e" />
        </g>
        <!-- boy -->
        <g>
          <rect x="206" y="196" width="46" height="36" rx="4" fill="#26231f" />
          <rect x="206" y="196" width="46" height="7" rx="3" fill="#1a1815" />
          <path d="M220 196v-7h18v7" fill="none" stroke="#1a1815" stroke-width="3" />
          <rect x="166" y="170" width="28" height="86" rx="6" fill="#161a2c" />
          <rect x="198" y="170" width="28" height="86" rx="6" fill="#161a2c" />
          <path d="M162 258h34l2 14h-42zM198 258h34l6 14h-44z" fill="#1c1c22" />
          <path d="M156 112c4-14 20-18 34-18s30 4 34 18l6 62-12 6H162l-12-6z" fill="#22305a" />
          <rect x="140" y="116" width="22" height="64" rx="10" fill="#22305a" />
          <rect x="230" y="116" width="22" height="64" rx="10" fill="#22305a" />
          <circle cx="151" cy="186" r="8" fill="#f3d2b3" />
          <circle cx="241" cy="186" r="8" fill="#f3d2b3" />
          <path d="M162 104l14-4 4 18-14-2zM218 104l-14-4-4 18 14-2z" fill="#2c3d70" />
          <rect x="178" y="92" width="26" height="22" fill="#f3d2b3" />
          <path d="M176 100h30l-4 16-11 14-11-14z" fill="#f1efe9" />
          <path d="M183 102l8 22 8-22-5-3h-6z" fill="#d42a2a" />
          <path d="M187 124l4 38 4-38z" fill="#c42222" />
          <path d="M178 126l-4 50M204 126l4 50" stroke="#18223f" stroke-width="2" />
          <rect x="164" y="146" width="22" height="22" rx="2" fill="none" stroke="#18223f" stroke-width="2" />
          <rect x="198" y="146" width="22" height="22" rx="2" fill="none" stroke="#18223f" stroke-width="2" />
          <ellipse cx="191" cy="66" rx="25" ry="28" fill="#f3d2b3" />
          <path d="M166 62c-2-22 14-34 28-32 14 2 24 12 22 30-4-10-10-16-22-16-10 0-20 2-28 18z" fill="#7a4a2a" />
          <circle cx="182" cy="68" r="2.6" fill="#2a1d14" />
          <circle cx="202" cy="68" r="2.6" fill="#2a1d14" />
          <path d="M184 80q8 6 16 0" fill="none" stroke="#b04a3a" stroke-width="2.4" stroke-linecap="round" />
        </g>
      </svg>

      <!-- A pupil at the blackboard -->
      <svg class="home-scene__board" viewBox="0 0 360 250" focusable="false">
        <rect x="6" y="6" width="348" height="190" rx="6" fill="#8a5a33" />
        <rect x="16" y="16" width="328" height="170" rx="3" fill="#2d3d36" />
        <rect x="16" y="16" width="328" height="170" rx="3" fill="none" stroke="#1d2a24" stroke-width="2" />
        <rect x="20" y="190" width="320" height="10" rx="2" fill="#6f4624" />
        <rect x="240" y="187" width="26" height="4" rx="1" fill="#f4f1e6" />
        <path d="M286 190h30l-6-12h-18z" fill="#6f8a6f" opacity=".8" />
        <g fill="#f4f1e6" font-family="Caveat, cursive" font-size="26">
          <text x="150" y="58">1½ : x = ½</text>
          <text x="150" y="96">1½ : ½ = 3</text>
          <text x="150" y="134" font-size="30">x = 3</text>
        </g>
        <path d="M150 142h46" stroke="#f4f1e6" stroke-width="2" stroke-linecap="round" opacity=".7" />
        <!-- pupil -->
        <path d="M44 250c0-40 18-60 50-62h30c32 2 50 22 50 62z" fill="#2a2f3a" />
        <path d="M70 188c0-14 10-22 34-22s34 8 34 22l-10 14H80z" fill="#7a2a2a" />
        <path d="M82 170l22 22 22-22-8-6H90z" fill="#fff" />
        <path d="M84 166l20 14 20-14 4 10-24 14-24-14z" fill="#d42a2a" />
        <path d="M96 182l8 4-3 30-8-22zM112 182l-8 4 3 30 8-22z" fill="#c42222" />
        <path d="M142 196c14-12 26-34 30-56" fill="none" stroke="#7a2a2a" stroke-width="16" stroke-linecap="round" />
        <circle cx="173" cy="136" r="9" fill="#f3d2b3" />
        <rect x="168" y="124" width="14" height="5" rx="2" fill="#fff" transform="rotate(-30 175 126)" />
        <rect x="92" y="140" width="24" height="30" fill="#f3d2b3" />
        <ellipse cx="104" cy="112" rx="31" ry="34" fill="#f3d2b3" />
        <path d="M74 108c-4-28 12-44 30-44s34 14 30 40c-8-16-16-22-30-22s-22 6-30 26z" fill="#7a4a2a" />
        <path d="M76 112c-6 14-6 32 0 46" fill="none" stroke="#7a4a2a" stroke-width="11" stroke-linecap="round" />
        <path d="M74 150c-4 8 2 14 6 14" fill="none" stroke="#2a1a10" stroke-width="3" />
        <circle cx="93" cy="116" r="2.8" fill="#2a1d14" />
        <circle cx="116" cy="116" r="2.8" fill="#2a1d14" />
        <circle cx="86" cy="127" r="6" fill="#ee9a8a" opacity=".6" />
        <circle cx="123" cy="127" r="6" fill="#ee9a8a" opacity=".6" />
        <path d="M95 130q9 7 18 0" fill="none" stroke="#b04a3a" stroke-width="2.4" stroke-linecap="round" />
      </svg>
    </div>
  </Teleport>
</template>

<style lang="sass">
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
    bottom: 0
    height: auto

  &__pair
    left: 0.5rem
    width: clamp(9rem, 17vw, 16rem)

  &__board
    right: 0.5rem
    width: clamp(12rem, 25vw, 23rem)
</style>
