<script setup lang="ts">
import girl from '../assets/girl.jpg'
import pioneer from '../assets/pioneer.jpg'
import stamp1951 from '../assets/stamp-1951.jpg'
import stamp1972 from '../assets/stamp-1972.jpg'

// Decorative background of the home page: real photographs and stamps of the Soviet school.
// Teleported to <body> as a fixed layer behind everything, so it stays put while the page scrolls.
// Pure decoration, hidden from assistive technology; authors and licences are listed in the page credits.
</script>

<template>
  <Teleport to="body">
    <div class="home-scene" aria-hidden="true">
      <figure class="home-scene__item home-scene__stamp home-scene__stamp--left">
        <img :src="stamp1951" alt="" loading="lazy">
      </figure>
      <figure class="home-scene__item home-scene__photo home-scene__photo--girl">
        <img :src="girl" alt="" loading="lazy">
      </figure>
      <figure class="home-scene__item home-scene__stamp home-scene__stamp--right">
        <img :src="stamp1972" alt="" loading="lazy">
      </figure>
      <figure class="home-scene__item home-scene__photo home-scene__photo--pioneer">
        <img :src="pioneer" alt="" loading="lazy">
      </figure>
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

  @media (min-width: 72rem)
    display: block

  &__item
    position: absolute
    margin: 0
    padding: 0.45rem
    background: #fbf7ec
    box-shadow: 0 2px 4px rgb(0 0 0 / 25%), 0 10px 24px rgb(0 0 0 / 22%)

    img
      display: block
      width: 100%
      height: 100%
      object-fit: cover

  &__photo
    img
      filter: sepia(0.25) contrast(1.02)

  &__photo--girl
    bottom: 2.5rem
    left: 1rem
    width: clamp(11rem, 16vw, 17rem)
    transform: rotate(-3deg)

    img
      aspect-ratio: 3 / 4
      object-position: 46% 50%

  &__photo--pioneer
    right: 1rem
    bottom: 2rem
    width: clamp(10rem, 14vw, 15rem)
    transform: rotate(2.5deg)

    img
      aspect-ratio: 2 / 3

  &__stamp
    width: clamp(7rem, 10vw, 10.5rem)

    img
      aspect-ratio: auto

  &__stamp--left
    top: 6rem
    left: 1.5rem
    transform: rotate(-4deg)

  &__stamp--right
    top: 6.5rem
    right: 1.5rem
    transform: rotate(3deg)
</style>
