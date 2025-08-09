<template>
  <div>
    The sum of {{ result.a }} and {{ result.b }} is <strong>{{ result.sum }}</strong>.
  </div>
</template>

<script setup lang="ts">
import { useQe } from '@/composables/useQe'
const result = useQe(10, 3)
</script>
