<template>
  <div>
    <input type="file" accept=".ifc" @change="onFileChange" />
    <div ref="container" class="viewer"/>
    <div v-if="loading" class="loading">Loading IFC...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
// Import all from engine_components (openbim-components)
import * as OBC from 'openbim-components'

const container = ref<HTMLElement | null>(null)
let components: OBC.Components | null = null
const loading = ref(false)

onMounted(() => {
  if (!container.value) return

  components = new OBC.Components()
  components.scene = new OBC.SimpleScene(components)
  components.renderer = new OBC.SimpleRenderer(components, container.value)
  components.camera = new OBC.SimpleCamera(components)
  components.raycaster = new OBC.SimpleRaycaster(components)
  components.init()

  // Add recommended lighting and controls for UX
  const scene = components.scene.get()
  const directionalLight = new OBC.THREE.DirectionalLight()
  directionalLight.position.set(10, 20, 10)
  directionalLight.intensity = 0.7
  scene.add(directionalLight)

  const ambientLight = new OBC.THREE.AmbientLight()
  ambientLight.intensity = 0.4
  scene.add(ambientLight)
})

// Load and display IFC Model
async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !components) return

  loading.value = true

  const arrayBuffer = await file.arrayBuffer()
  
  // FragmentsManager manages loading and parsing IFC 
  const fragments = components.get(OBC.FragmentsManager)
  await fragments.init('https://unpkg.com/web-ifc@0.0.44/IFCWorker.js')
  await fragments.load(new Uint8Array(arrayBuffer))

  loading.value = false
}

// Clean up viewer
onBeforeUnmount(() => {
  if (components) components.dispose()
})
</script>

<style scoped>
.viewer {
  width: 100vw;
  height: 90vh;
  background: #222;
}
.loading {
  position: absolute;
  top: 2rem;
  left: 2rem;
  color: #ff0;
  background: #333b;
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 10;
}
</style>
