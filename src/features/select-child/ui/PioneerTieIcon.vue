<script setup lang="ts">
import tie from '../assets/tie.png'
</script>

<template>
  <img class="tie-icon" :src="tie" alt="" aria-hidden="true" width="24" height="24">
</template>

<style lang="sass" scoped>
.tie-icon
  width: 1.4em
  height: 1.4em
  flex-shrink: 0
  object-fit: contain
</style>
