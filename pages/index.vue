<template>
  <div>
    <h1>All Available Pages</h1>
    <ul>
      <li v-for="route in pageRoutes" :key="route.path">
        <NuxtLink :to="route.path">{{ route.name || route.path }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Get all routes
const router = useRouter()

// Filter only base pages (not dynamic child routes, not error pages, not admin/etc if you wish)
const pageRoutes = computed(() => 
  router.options.routes
    .filter(route =>
      route.path !== '/' && // exclude index itself
      !route.path.startsWith('/_') && // exclude _fallback etc
      !route.path.includes(':') // exclude dynamic routes
    )
)
</script>
