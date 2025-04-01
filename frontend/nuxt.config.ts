// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss'],
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: true,
    },
  },
  vite: {
    optimizeDeps: { include: ['@fontsource-variable/nunito'] },
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },
})
