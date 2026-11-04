<script setup lang="ts">
import board from '../assets/board.jpg'
import pair from '../assets/pair.jpg'
import reader from '../assets/reader.jpg'

// Decorative background of the home page: paintings of Soviet schoolchildren scattered over the page.
// They are teleported into <main> (full width, behind the content) and scroll together with the page.
// Pure decoration, hidden from assistive technology.
type Picture = { src: string; style: Record<string, string> }

// Every picture appears once; they are scattered over the height of the page in a deliberately uneven order.
const pictures: Picture[] = [
  { src: pair, style: { top: '3%', left: '1.4%', width: 'clamp(9.5rem, 16vw, 17rem)', '--turn': '-4deg' } },
  { src: board, style: { top: '41%', right: '1.6%', width: 'clamp(9rem, 15vw, 16rem)', '--turn': '3deg' } },
  { src: reader, style: { top: '74%', left: '0.9%', width: 'clamp(8.5rem, 14vw, 15rem)', '--turn': '2.5deg' } },
]
</script>

<template>
  <Teleport to=".app-main">
    <div class="home-scene" aria-hidden="true">
      <img v-for="(picture, index) in pictures" :key="index" class="home-scene__picture" :src="picture.src" :style="picture.style" alt="" loading="lazy">
    </div>
  </Teleport>
</template>

<style lang="sass">
.home-scene
  position: absolute
  inset: 0
  z-index: -1
  display: none
  overflow: hidden
  pointer-events: none

  @media (min-width: 72rem)
    display: block

  &__picture
    position: absolute
    aspect-ratio: 1
    object-fit: cover
    padding: 0.4rem
    background: #fbf7ec
    box-shadow: 0 2px 4px rgb(0 0 0 / 22%), 0 10px 22px rgb(0 0 0 / 18%)
    opacity: 0.92
    transform: rotate(var(--turn, 0deg))
</style>
