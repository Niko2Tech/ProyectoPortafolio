// stores/caja.ts
import { defineStore } from 'pinia'

// Interfaces para tipar los datos
interface Caja {
  id: string
  usuarioId: string
  fechaApertura: Date
  montoApertura: number
  fechaCierre?: Date
  montoCierre?: number
  diferencia?: number
  estado: 'abierta' | 'cerrada'
  comentario?: string
}

interface AbrirCajaDto {
  montoApertura: number
  usuarioId: string
}

interface CerrarCajaDto {
  id: string
  montoCierre: number
  comentario?: string
  usuarioId: string
  estado: 'abierta' | 'cerrada'
}

interface CajaState {
  cajaActual: Caja | null
  loading: boolean
  error: string | null
}

export const useCajaStore = defineStore('caja', {
  state: (): CajaState => ({
    cajaActual: null,
    loading: false,
    error: null,
  }),

  getters: {
    // Verifica si hay una caja abierta
    tieneCajaAbierta: (state): boolean => {
      return state.cajaActual !== null && state.cajaActual.estado === 'abierta'
    },

    // Obtiene el ID de la caja actual
    cajaId: (state): string | null => {
      return state.cajaActual?.id || null
    },

    // Obtiene información de la caja actual
    infoCaja: (state): Caja | null => {
      return state.cajaActual
    },

    // Calcula el tiempo que lleva abierta la caja
    tiempoAbierta: (state): string | null => {
      if (!state.cajaActual || state.cajaActual.estado !== 'abierta') {
        return null
      }

      const ahora = new Date()
      const apertura = new Date(state.cajaActual.fechaApertura)
      const diff = ahora.getTime() - apertura.getTime()

      const horas = Math.floor(diff / (1000 * 60 * 60))
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      return `${horas}h ${minutos}m`
    },
  },

  actions: {
    // Acción para abrir una caja
    async abrirCaja(abrirCajaDto: AbrirCajaDto): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        const response = await useApiFetch('/caja/abrir-caja', {
          method: 'POST',
          body: abrirCajaDto,
        })

        if (response) {
          this.cajaActual = {
            ...response,
            fechaApertura: new Date(response.fechaApertura),
            estado: 'abierta',
          }

          // Guardar en localStorage para persistencia
          this.persistirCaja()

          return true
        }

        return false
      } catch (error: any) {
        this.error = error.message || 'Error al abrir la caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Acción para buscar una caja abierta
    async buscarCajaAbierta(usuarioId: string): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        const response = await useApiFetch(`/caja/buscar-caja-abierta-usuario/${usuarioId}`)

        if (response && response.estado === 'abierta') {
          this.cajaActual = {
            ...response,
            fechaApertura: new Date(response.fechaApertura),
            fechaCierre: response.fechaCierre ? new Date(response.fechaCierre) : undefined,
          }

          this.persistirCaja()
          return true
        } else {
          this.cajaActual = null
          this.limpiarPersistencia()
          return false
        }
      } catch (error: any) {
        this.error = error.message || 'Error al buscar la caja'
        this.cajaActual = null
        this.limpiarPersistencia()
        return false
      } finally {
        this.loading = false
      }
    },

    // Acción para cerrar una caja
    async cerrarCaja(cerrarCajaDto: CerrarCajaDto): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        const response = await useApiFetch('/caja/cerrar-caja', {
          method: 'PUT',
          body: cerrarCajaDto,
        })

        if (response) {
          this.cajaActual = {
            ...response,
            fechaApertura: new Date(response.fechaApertura),
            fechaCierre: new Date(response.fechaCierre),
            estado: 'cerrada',
          }

          // Limpiar la persistencia ya que la caja está cerrada
          this.limpiarPersistencia()

          // Limpiar el estado después de un breve delay para mostrar el resultado
          setTimeout(() => {
            this.cajaActual = null
          }, 2000)

          return true
        }

        return false
      } catch (error: any) {
        this.error = error.message || 'Error al cerrar la caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verificar si el usuario puede realizar transacciones
    async verificarCajaParaTransaccion(usuarioId: string): Promise<string> {
      if (!this.tieneCajaAbierta) {
        // Intentar buscar una caja abierta
        const cajaEncontrada = await this.buscarCajaAbierta(usuarioId)

        if (!cajaEncontrada) {
          throw new Error(
            'No hay una caja abierta. Debe abrir una caja antes de realizar transacciones.'
          )
        }
      }

      // Verificar que la caja pertenece al usuario
      if (this.cajaActual?.usuarioId !== usuarioId) {
        throw new Error('La caja abierta pertenece a otro usuario.')
      }

      return this.cajaId!
    },

    // Persistir la caja en localStorage
    persistirCaja() {
      if (import.meta.client && this.cajaActual) {
        localStorage.setItem(
          'caja_abierta',
          JSON.stringify({
            ...this.cajaActual,
            fechaApertura: this.cajaActual.fechaApertura.toISOString(),
            fechaCierre: this.cajaActual.fechaCierre?.toISOString(),
          })
        )
      }
    },

    // Cargar caja desde localStorage
    cargarCajaPersistida() {
      if (import.meta.client) {
        const cajaGuardada = localStorage.getItem('caja_abierta')
        if (cajaGuardada) {
          try {
            const caja = JSON.parse(cajaGuardada)
            this.cajaActual = {
              ...caja,
              fechaApertura: new Date(caja.fechaApertura),
              fechaCierre: caja.fechaCierre ? new Date(caja.fechaCierre) : undefined,
            }
          } catch (error) {
            console.error('Error al cargar caja persistida:', error)
            this.limpiarPersistencia()
          }
        }
      }
    },

    // Limpiar persistencia
    limpiarPersistencia() {
      if (import.meta.client) {
        localStorage.removeItem('caja_abierta')
      }
    },

    // Limpiar error
    limpiarError() {
      this.error = null
    },

    // Reset del store
    reset() {
      this.cajaActual = null
      this.loading = false
      this.error = null
      this.limpiarPersistencia()
    },
  },
})

// Composable para usar en componentes
export const useCaja = () => {
  const cajaStore = useCajaStore()

  return {
    // Estado
    cajaActual: computed(() => cajaStore.cajaActual),
    loading: computed(() => cajaStore.loading),
    error: computed(() => cajaStore.error),

    // Getters
    tieneCajaAbierta: computed(() => cajaStore.tieneCajaAbierta),
    cajaId: computed(() => cajaStore.cajaId),
    infoCaja: computed(() => cajaStore.infoCaja),
    tiempoAbierta: computed(() => cajaStore.tiempoAbierta),

    // Actions
    abrirCaja: cajaStore.abrirCaja,
    buscarCajaAbierta: cajaStore.buscarCajaAbierta,
    cerrarCaja: cajaStore.cerrarCaja,
    verificarCajaParaTransaccion: cajaStore.verificarCajaParaTransaccion,
    cargarCajaPersistida: cajaStore.cargarCajaPersistida,
    limpiarError: cajaStore.limpiarError,
    reset: cajaStore.reset,
  }
}
