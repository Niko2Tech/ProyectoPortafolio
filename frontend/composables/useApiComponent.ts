// composables/useApiComponent.ts
import { useRuntimeConfig, useNuxtApp, useRequestHeaders } from '#imports'

export function useApiComponent<T = any>(endpoint: string, options: any = {}) {
  const config = useRuntimeConfig()

  const baseConfig = {
    baseURL: config.public.apiBaseUrl,
    credentials: 'include' as const,
    ...options,
  }

  if (import.meta.server) {
    const headers = useRequestHeaders(['cookie'])
    baseConfig.headers = {
      ...baseConfig.headers,
      ...headers,
    }
  }

  return useFetch<T>(endpoint, {
    ...baseConfig,
    onResponseError({ response }) {
      if (response.status === 401) {
        const { $pinia } = useNuxtApp()
        const userStore = useUserStore($pinia)
        userStore.clearUsuario()
        navigateTo('/login')
      }
    },
  })
}
