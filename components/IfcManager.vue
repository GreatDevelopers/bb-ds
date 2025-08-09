<template>
  <div>
    <input type="file" accept=".ifc" @change="onFileUpload" />
    <input type="text" v-model="urlInput" placeholder="Paste IFC file URL" />
    <button @click="loadFromUrl">Load from URL</button>
    <div>
      <label for="public-list">Choose from public folder:</label>
      <select v-model="selectedPublicFile" @change="loadFromPublic">
        <option v-for="f in publicFiles" :key="f" :value="f">{{ f }}</option>
      </select>
    </div>
    <div ref="container" class="viewer"></div>
    <div v-if="loading" class="loading">Loading IFC...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as OBC from 'openbim-components'

const container = ref<HTMLElement | null>(null)
let components: OBC.Components | null = null
const loading = ref(false)
const urlInput = ref('')
const selectedPublicFile = ref('')
const publicFiles = ref<string[]>([])

onMounted(async () => {
  if (!container.value) return
  components = new OBC.Components()
  components.scene = new OBC.SimpleScene(components)
  components.renderer = new OBC.SimpleRenderer(components, container.value)
  components.camera = new OBC.SimpleCamera(components)
  components.raycaster = new OBC.SimpleRaycaster(components)
  components.init()
  // Add lights for better visuals
  const scene = components.scene.get()
  const dLight = new OBC.THREE.DirectionalLight()
  dLight.position.set(10, 20, 10)
  dLight.intensity = 0.7
  scene.add(dLight)
  const aLight = new OBC.THREE.AmbientLight()
  aLight.intensity = 0.4
  scene.add(aLight)
  // Fetch public folder .ifc files (via Nuxt server API)
  const res = await fetch('/api/list-public-ifc')
  publicFiles.value = await res.json()
})

async function loadIfcFile(url: string) {
  loading.value = true
  if (!components) return
  const fragments = components.get(OBC.FragmentsManager)
  await fragments.init('https://unpkg.com/web-ifc@0.0.44/IFCWorker.js')
  await fragments.load(url)
  loading.value = false
}

// Upload and save file to /public, then load
async function onFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  loading.value = true
  // POST to Nuxt server API to save
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/upload-ifc', { method: 'POST', body: form })
  const { filename } = await res.json()
  // Load from public folder
  await loadIfcFile(`/public/${filename}`)
}

async function loadFromUrl() {
  if (!urlInput.value) return
  loading.value = true
  // Download file and save to /public via server
  const res = await fetch('/api/save-from-url', {
    method: 'POST',
    body: JSON.stringify({ url: urlInput.value }),
    headers: { 'Content-Type': 'application/json' }
  })
  const { filename } = await res.json()
  await loadIfcFile(`/public/${filename}`)
}

async function loadFromPublic() {
  if (!selectedPublicFile.value) return
  await loadIfcFile(`/public/${selectedPublicFile.value}`)
}

onBeforeUnmount(() => {
  if (components) components.dispose()
})
</script>

<style scoped>
.viewer { width: 100vw; height: 90vh; background: #222; }
.loading { position: absolute; top: 2rem; left: 2rem; color: #ff0; background: #333b; padding: 1rem 2rem; border-radius: 8px; z-index: 10; }
</style>
