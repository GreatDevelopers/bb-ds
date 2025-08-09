<template>
  <client-only>
    <WorldExample />
  </client-only>
</template>

<script setup lang="ts">
import WorldExample from '~/components/cube.vue'

definePageMeta({
  ssr: false,
})
</script>
