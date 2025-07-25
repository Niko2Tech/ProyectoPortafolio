<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Movimientos de la última caja</h2>

    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-gray-600">Cargando...</p>
    </div>
    <div v-else-if="movimientosAgrupados.length" class="h-[500px] overflow-auto">
      <div v-for="grupo in movimientosAgrupados" :key="grupo.metodoPago" class="mb-6">
        <h3 class="text-md font-medium text-gray-700 mb-2">{{ grupo.metodoPago }}</h3>
        <table class="table w-full mb-2">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mov in grupo.movimientos" :key="mov.id">
              <td>{{ new Date(mov.fecha).toLocaleString() }}</td>
              <td>{{ mov.tipoMovimiento }}</td>
              <td>{{ formatChileanCurrency(Number(mov.monto)) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="text-right mb-4">
          <span class="font-semibold text-gray-800">
            Total {{ grupo.metodoPago }}: {{ formatChileanCurrency(grupo.total) }}
          </span>
        </div>
      </div>

      <div class="border-t-2 border-gray-300 pt-4 mt-4">
        <div class="text-right">
          <span class="text-lg font-bold text-gray-900">
            Total General: {{ formatChileanCurrency(totalGeneral) }}
          </span>
        </div>
      </div>
    </div>
    <div v-else class="text-gray-500 text-center py-4">No hay movimientos registrados.</div>
  </div>
</template>

<script setup lang="ts">
import { useApiFetch } from '~/composables/useApiFetch'
import { useUserStore } from '~/stores/user'
import { formatChileanCurrency } from '#imports'
const user = useUserStore()

interface MovimientoCaja {
  id: string
  cajaId: string
  tipoMovimiento: string
  metodoPagoId: number
  monto: string
  documentoId: string
  tipoDocumento: string
  fecha: string
  usuarioId: string
  metodoPago: {
    nombre: string
  }
}

interface GrupoMovimientos {
  metodoPago: string
  movimientos: MovimientoCaja[]
  total: number
}

const movimientos = ref<MovimientoCaja[]>([])
const movimientosAgrupados = ref<GrupoMovimientos[]>([])
const totalGeneral = ref(0)
const loading = ref(true)

const agruparMovimientos = (movimientos: MovimientoCaja[]) => {
  const grupos: { [key: string]: MovimientoCaja[] } = {}

  movimientos.forEach((mov) => {
    const metodoPago = mov.metodoPago.nombre
    if (!grupos[metodoPago]) {
      grupos[metodoPago] = []
    }
    grupos[metodoPago].push(mov)
  })

  const gruposArray: GrupoMovimientos[] = Object.keys(grupos).map((metodoPago) => {
    const movimientosGrupo = grupos[metodoPago]
    const total = movimientosGrupo.reduce((sum, mov) => sum + Number(mov.monto), 0)
    return {
      metodoPago,
      movimientos: movimientosGrupo,
      total,
    }
  })

  return gruposArray
}

onMounted(async () => {
  try {
    const response = await useApiFetch(`/caja/ultima-caja-movimiento-usuario/${user.id}`)

    if (response && typeof response === 'object' && 'id' in response) {
      movimientos.value = [response as MovimientoCaja]
    } else if (Array.isArray(response)) {
      movimientos.value = response
    } else {
      movimientos.value = []
    }

    // Agrupar movimientos por método de pago
    movimientosAgrupados.value = agruparMovimientos(movimientos.value)

    // Calcular total general
    totalGeneral.value = movimientos.value.reduce((sum, mov) => sum + Number(mov.monto), 0)
  } catch (error) {
    console.error('Error:', error)
    movimientos.value = []
    movimientosAgrupados.value = []
    totalGeneral.value = 0
  } finally {
    loading.value = false
  }
})
</script>
