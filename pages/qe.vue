<template>
  <div>
    <label>
      A: <input type="number" v-model.number="a" />
    </label>
    <label>
      B: <input type="number" v-model.number="b" />
    </label>
    <div style="margin-top: 1em;">
      The sum of {{ result.a }} and {{ result.b }} is <strong>{{ result.sum }}</strong>.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQe } from '@/composables/useQe'

const a = ref(10)
const b = ref(3)
const result = computed(() => useQe(a.value, b.value))
</script>