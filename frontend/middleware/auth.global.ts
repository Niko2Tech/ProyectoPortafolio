// middleware/auth.global.ts
import { useUserStore } from '@/stores/user'

export default defineNuxtRouteMiddleware(async (to) => {
  const pinia = useNuxtApp().$pinia
  const user = useUserStore(pinia)

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/']

  // Si estamos en una ruta pública, no hacer nada
  if (publicRoutes.includes(to.path)) {
    return
  }

  // SERVIDOR: Siempre verificar en la primera carga/refresh
  if (import.meta.server) {
    try {
      await user.verify()

      // Si no está autenticado en servidor, redirigir inmediatamente
      if (!user.isAuthenticated) {
        throw createError({
          statusCode: 401,
          statusMessage: 'No autorizado',
        })
      }
    } catch (error) {
      // Redirigir a login si hay error de autenticación
      return navigateTo('/login')
    }
    return
  }

  // CLIENTE: Solo verificar si no tenemos datos (navegación SPA)
  if (import.meta.client) {
    // Si ya tenemos usuario, verificar si necesitamos revalidar
    if (user.isAuthenticated) {
      // Verificar cada 10 minutos en navegación
      const lastCheck = user.lastVerified || 0
      const now = Date.now()
      const tenMinutes = 10 * 60 * 1000

      if (now - lastCheck > tenMinutes) {
        try {
          await user.forceVerify()
        } catch (error) {
          return navigateTo('/login')
        }
      } else {
        return
      }
    } else {
      // Si no tenemos usuario, verificar una sola vez
      if (!user.hasChecked) {
        try {
          await user.verify()
        } catch (error) {
          user.clearUsuario()
        }
      }

      // Si después de verificar no está autenticado, redirigir
      if (!user.isAuthenticated) {
        return navigateTo('/login')
      }
    }
  }
})
