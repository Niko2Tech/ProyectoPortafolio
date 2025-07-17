<template>
  <div class="p-4">
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
      <p class="mt-2 text-gray-600">Cargando...</p>
    </div>
    <div v-else-if="movimientosAgrupados.length" class="">
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
import { formatChileanCurrency } from '#imports'
import { watch, ref } from 'vue'

const props = defineProps({
  movimientos: {
    type: Array,
    required: true,
  },
})

interface Movimiento {
  id: string
  cajaId: string
  tipoMovimiento: string
  metodoPagoId: number
  monto: string
  documentoId: string
  tipoDocumento: string
  fecha: string
  usuarioId: string
  metodoPago?: { nombre: string }
}

interface GrupoMovimientos {
  metodoPago: string
  movimientos: Movimiento[]
  total: number
}

const movimientosAgrupados = ref<GrupoMovimientos[]>([])
const totalGeneral = ref(0)
const loading = ref(false)

function agruparMovimientos(movimientos: Movimiento[]): GrupoMovimientos[] {
  const grupos: { [key: string]: Movimiento[] } = {}
  movimientos.forEach((mov) => {
    const metodoPago = mov.metodoPago?.nombre || 'Otro'
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

watch(
  () => props.movimientos,
  (movimientos) => {
    loading.value = true
    movimientosAgrupados.value = agruparMovimientos(movimientos as Movimiento[])
    totalGeneral.value = (movimientos as Movimiento[]).reduce(
      (sum, mov) => sum + Number(mov.monto),
      0
    )
    loading.value = false
  },
  { immediate: true }
)
</script>
