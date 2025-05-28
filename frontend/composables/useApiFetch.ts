import { useRuntimeConfig, useRequestHeaders } from '#imports'

export async function useApiFetch<T = any>(endpoint: string, options: any = {}): Promise<T> {
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

  return await $fetch<T>(endpoint, baseConfig)
}
