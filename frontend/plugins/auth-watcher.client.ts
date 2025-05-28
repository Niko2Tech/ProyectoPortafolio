// plugins/auth-watcher.client.ts
export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  let intervalId: NodeJS.Timeout | null = null

  const startAuthWatcher = () => {
    intervalId = setInterval(
      async () => {
        const { $pinia } = useNuxtApp()
        const userStore = useUserStore($pinia)
        const route = useRoute()

        const publicRoutes = ['/login', '/']
        if (userStore.isAuthenticated && !publicRoutes.includes(route.path)) {
          try {
            await userStore.forceVerify()
          } catch (error) {
            userStore.clearUsuario()
            await navigateTo('/login')
          }
        }
      },
      5 * 60 * 1000
    ) // Cada 5 minutos
  }

  const stopAuthWatcher = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Iniciar watcher inmediatamente
  startAuthWatcher()

  // Detener watcher al cerrar pestaña o recargar
  window.addEventListener('beforeunload', stopAuthWatcher)

  // Verificación extra al volver al foco
  window.addEventListener('focus', async () => {
    const { $pinia } = useNuxtApp()
    const userStore = useUserStore($pinia)
    const route = useRoute()

    const publicRoutes = ['/login', '/']
    if (userStore.isAuthenticated && !publicRoutes.includes(route.path)) {
      try {
        await userStore.forceVerify()
      } catch (error) {
        userStore.clearUsuario()
        await navigateTo('/login')
      }
    }
  })
})
