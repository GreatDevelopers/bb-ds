<template>
  <div id="container" ref="container" class="viewer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import * as BUI from '@thatopen/ui'
import * as OBC from '@thatopen/components'

const container = ref<HTMLElement | null>(null)
let components: OBC.Components | null = null
let world: ReturnType<OBC.Worlds['create']> | null = null

onMounted(async () => {
  if (!container.value) {
    console.error('Container div not found!')
    return
  }

  try {
    components = new OBC.Components()

    const worlds = components.get(OBC.Worlds)
    world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>()
    world.scene = new OBC.SimpleScene(components)
    world.renderer = new OBC.SimpleRenderer(components, container.value)
    world.camera = new OBC.SimpleCamera(components)
    components.init()
    world.scene.setup()
    world.scene.three.background = null

    // --- BUILDING ONLY ---
    // Camera initial after fragment load
    // Fragment manager setup
    const workerUrlRaw = 'https://thatopen.github.io/engine_fragment/resources/worker.mjs'
    const response = await fetch(workerUrlRaw)
    const workerBlob = await response.blob()
    const workerFile = new File([workerBlob], 'worker.mjs', { type: 'text/javascript' })
    const workerUrl = URL.createObjectURL(workerFile)

    const fragments = components.get(OBC.FragmentsManager)
    fragments.init(workerUrl)
    world.camera.controls.addEventListener('rest', () => fragments.core.update(true))
    fragments.list.onItemSet.add(({ value: model }) => {
      model.useCamera(world.camera.three)
      world.scene.three.add(model.object)
      fragments.core.update(true)
    })

    // Load fragment(s)
    const fragPaths = [
      'https://thatopen.github.io/engine_components/resources/frags/school_arq.frag',
    ]
    await Promise.all(
      fragPaths.map(async (path) => {
        const modelId = path.split('/').pop()?.split('.').shift()
        if (!modelId) return null
        const file = await fetch(path)
        const buffer = await file.arrayBuffer()
        return fragments.core.load(buffer, { modelId })
      }),
    )

    await world.camera.controls.setLookAt(68, 23, -8.5, 21.5, -5.5, 23)
    await fragments.core.update(true)

    // --- UI, Panel, etc (common) ---
    BUI.Manager.init()
    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
        <bim-panel label="Worlds Tutorial" class="options-menu">
          <bim-panel-section label="Controls">
            <bim-color-input label="Background Color" color="#202932"
              @input=${({ target }: { target: BUI.ColorInput }) => {
                if (!world) return
                world.scene.config.backgroundColor = new THREE.Color(target.color)
              }}
            ></bim-color-input>
            <bim-number-input slider step="0.1" label="Directional lights intensity" value="1.5" min="0.1" max="10"
              @change=${({ target }: { target: BUI.NumberInput }) => {
                if (!world) return
                world.scene.config.directionalLight.intensity = target.value
              }}
            ></bim-number-input>
            <bim-number-input slider step="0.1" label="Ambient light intensity" value="1" min="0.1" max="5"
              @change=${({ target }: { target: BUI.NumberInput }) => {
                if (!world) return
                world.scene.config.ambientLight.intensity = target.value
              }}
            ></bim-number-input>
          </bim-panel-section>
        </bim-panel>
      `
    })
    document.body.append(panel)
    const button = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
        <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
          @click=${() => {
            if (panel.classList.contains("options-menu-visible")) {
              panel.classList.remove("options-menu-visible")
            } else {
              panel.classList.add("options-menu-visible")
            }
          }}
        ></bim-button>
      `
    })
    document.body.append(button)
  } catch (e) {
    console.error('Failed to initialize ThatOpen world:', e)
  }
})

onBeforeUnmount(() => {
  if (components) components.dispose()
})
</script>

<style scoped>
.viewer {
  width: 100vw;
  height: 100vh;
  background-color: #222;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
}
.options-menu { position: absolute; top: 10px; right: 10px; z-index: 10; }
.phone-menu-toggler { position: absolute; bottom: 20px; right: 20px; z-index: 20; }
</style>
