// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ],

  css: [
    '@/assets/css/global.css'
  ],

  vite: {
    optimizeDeps: {
      include: [
        'three',
        'stats.js',
        '@thatopen/components',
        '@thatopen/ui',
        '@thatopen/fragments',
        '@thatopen/components-front',
        '@thatopen/ui-obc'
      ]
    }
  }
})
