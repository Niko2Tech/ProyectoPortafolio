import { defineStore } from 'pinia'
import { useApiFetch } from '@/composables/useApiFetch'

interface Rol {
  id: number
  nombre: string
  descripcion: string
}

interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  rolId: number
  active: boolean
  rol: Rol
}

interface LoginData {
  email: string
  password: string
}

export const useUserStore = defineStore('user', {
  state: (): {
    usuario: Usuario | null
    isLoading: boolean
    hasChecked: boolean
    lastVerified: number
  } => ({
    usuario: null,
    isLoading: false,
    hasChecked: false,
    lastVerified: 0,
  }),

  getters: {
    isAuthenticated: (state) => !!state.usuario,
    nombreCompleto: (state) =>
      state.usuario ? `${state.usuario.nombre} ${state.usuario.apellido}` : '',
    id: (state) => state.usuario?.id,
    email: (state) => state.usuario?.email,
    rolNombre: (state) => state.usuario?.rol?.nombre,
  },

  actions: {
    setUsuario(data: Usuario) {
      this.usuario = data
      this.hasChecked = true
      this.lastVerified = Date.now()
    },

    clearUsuario() {
      this.usuario = null
      this.hasChecked = true
      this.lastVerified = 0
    },

    async login(data: LoginData) {
      this.isLoading = true
      try {
        const response = await useApiFetch<Usuario>('/auth/login', {
          method: 'POST',
          body: data,
        })

        this.setUsuario(response)
        return response
      } catch (err) {
        this.clearUsuario()
        console.error('Login error:', err)
        throw new Error('Credenciales inválidas o error de autenticación')
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        await useApiFetch('/auth/logout', { method: 'POST' })
      } catch (error) {
        console.warn('Error en logout:', error)
      } finally {
        this.clearUsuario()
        this.isLoading = false
      }
    },

    async verify() {
      this.isLoading = true
      try {
        const response = await useApiFetch<Usuario>('/auth/verify')
        this.setUsuario(response)
        return response
      } catch (error) {
        console.error('Verify error:', error)
        this.clearUsuario()
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async forceVerify() {
      this.hasChecked = false
      return await this.verify()
    },
  },
})
