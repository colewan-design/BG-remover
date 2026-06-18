// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      backendApiBase: process.env.NUXT_PUBLIC_BACKEND_API_BASE || 'http://localhost/bgremover/backend/api',
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
  },
})
