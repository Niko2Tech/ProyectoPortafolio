<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 p-4 rounded-lg max-w-3xl w-full mx-auto text-lg min-w-2xl">
      <div class="mb-6">
        <p class="text-xl mb-2">
          <span class="font-bold">Fecha de apertura:</span>
          {{
            formatFecha(
              typeof cajaActual?.fechaApertura === 'string'
                ? cajaActual?.fechaApertura
                : cajaActual?.fechaApertura?.toISOString()
            )
          }}
        </p>
        <p class="text-xl mb-2">
          <span class="font-bold">Monto de apertura:</span>
          ${{ Number(cajaActual?.montoApertura).toLocaleString('es-CL') }}
        </p>
        <div v-if="montosPorMetodo.length > 0" class="mt-4 bg-base-200 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-3">Resumen de ventas por método de pago:</h3>
          <div class="space-y-2">
            <div
              v-for="metodo in montosPorMetodo"
              :key="metodo.metodoPagoId"
              class="flex justify-between"
            >
              <span>{{ metodo.nombre }}:</span>
              <span class="font-semibold">${{ Number(metodo.monto).toLocaleString('es-CL') }}</span>
            </div>
            <div class="border-t pt-2 mt-2">
              <div class="flex justify-between font-bold text-lg">
                <span>Total de ventas (todos los métodos):</span>
                <span>${{ totalVentasTodosMetodos.toLocaleString('es-CL') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cajaActual" class="p-4 bg-base-200 rounded-lg mb-6">
        <h3 class="font-bold text-lg mb-3">Detalle de efectivo esperado:</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Monto de apertura:</span>
            <span class="font-semibold"
              >${{ Number(cajaActual.montoApertura).toLocaleString('es-CL') }}</span
            >
          </div>
          <div class="flex justify-between">
            <span>Ventas en efectivo:</span>
            <span class="font-semibold">${{ totalVentasEfectivo.toLocaleString('es-CL') }}</span>
          </div>
          <div class="border-t pt-2 mt-2">
            <div class="flex justify-between font-bold text-lg">
              <span>Efectivo esperado en caja:</span>
              <span>${{ efectivoEsperadoEnCaja.toLocaleString('es-CL') }}</span>
            </div>
          </div>
        </div>
      </div>

      <form class="space-y-8" @submit.prevent="cerrarCajaBtn">
        <label class="form-control w-full floating-label">
          <span class="text-xl">Monto final en efectivo (contado por el vendedor)</span>
          <input
            v-model.number="montoEfectivoFinal"
            type="number"
            min="0"
            class="input input-bordered input-lg w-full font-bold text-xl"
            required
          />
        </label>

        <div v-if="montoEfectivoFinal >= 0" class="p-4 bg-base-200 rounded-lg">
          <div class="space-y-2">
            <div class="flex justify-between">
              <span>Efectivo esperado en caja:</span>
              <span class="font-semibold"
                >${{ efectivoEsperadoEnCaja.toLocaleString('es-CL') }}</span
              >
            </div>
            <div class="flex justify-between">
              <span>Efectivo ingresado por el vendedor:</span>
              <span class="font-semibold">${{ montoEfectivoFinal.toLocaleString('es-CL') }}</span>
            </div>
            <div class="border-t pt-2">
              <div
                class="flex justify-between font-bold text-lg"
                :class="diferencia >= 0 ? 'text-success' : 'text-error'"
              >
                <span>Diferencia:</span>
                <span>${{ diferencia.toLocaleString('es-CL') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="alert alert-error text-xl py-4">{{ errorMsg }}</div>
        <div v-if="successMsg" class="alert alert-success text-xl py-4">{{ successMsg }}</div>
        <div class="flex justify-end gap-6 mt-8">
          <button type="submit" class="btn btn-primary btn-lg text-lg" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isProcessing ? 'Cerrando...' : 'Cerrar Caja' }}
          </button>
        </div>
      </form>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCaja } from '~/stores/caja'
import { useUserStore } from '~/stores/user'
import { useApiFetch } from '~/composables/useApiFetch'

const user = useUserStore()
const { cajaActual, cerrarCaja } = useCaja()

const montoEfectivoFinal = ref(0)
const montosPorMetodo = ref<Array<{ metodoPagoId: number; nombre: string; monto: string }>>([])
const isProcessing = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Computed property for total sales across all payment methods
const totalVentasTodosMetodos = computed(() => {
  return montosPorMetodo.value.reduce((total, metodo) => {
    return total + Number(metodo.monto)
  }, 0)
})

// Computed property for total cash sales
const totalVentasEfectivo = computed(() => {
  // Assuming 'Efectivo' is the name for cash payments.
  // You might need to adjust this based on your actual data for 'nombre' or 'metodoPagoId'.
  const efectivoMetodo = montosPorMetodo.value.find(
    (metodo) => metodo.nombre.toLowerCase() === 'efectivo'
  )
  return efectivoMetodo ? Number(efectivoMetodo.monto) : 0
})

// Computed property for expected cash in the drawer (opening amount + cash sales)
const efectivoEsperadoEnCaja = computed(() => {
  const apertura = Number(cajaActual.value?.montoApertura || 0)
  return apertura + totalVentasEfectivo.value
})

// Computed property for the difference between actual cash and expected cash
const diferencia = computed(() => {
  return montoEfectivoFinal.value - efectivoEsperadoEnCaja.value
})

onMounted(async () => {
  if (cajaActual.value?.id) {
    try {
      const response = await useApiFetch(`/caja/monto-total-caja-actual/${cajaActual.value.id}`)
      montosPorMetodo.value = response
    } catch (e) {
      console.error('Error al obtener montos por método de pago:', e)
      montosPorMetodo.value = []
    }
  }
})

function formatFecha(fecha: string | undefined) {
  if (!fecha) return ''
  const d = new Date(fecha)
  return d.toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })
}

// No longer needed as difference is reactive
// function calcularDiferencia() {}

async function cerrarCajaBtn() {
  errorMsg.value = ''
  successMsg.value = ''
  isProcessing.value = true
  try {
    await cerrarCaja({
      id: cajaActual.value?.id!,
      montoCierre: montoEfectivoFinal.value,
      // Updated comentario to reflect the new calculation
      comentario: `Diferencia: $${diferencia.value.toLocaleString('es-CL')} - Efectivo esperado: $${efectivoEsperadoEnCaja.value.toLocaleString('es-CL')} - Monto ingresado: $${montoEfectivoFinal.value.toLocaleString('es-CL')}`,
      usuarioId: user.id!,
      estado: 'cerrada',
    })
    successMsg.value = '¡Caja cerrada exitosamente!'
    // Consider a small delay before navigating to allow success message to be seen
    setTimeout(() => {
      navigateTo('/caja')
    }, 1500)
  } catch (e) {
    console.error('Error al cerrar la caja:', e)
    errorMsg.value = 'Error al cerrar la caja. Intente nuevamente.'
  } finally {
    isProcessing.value = false
  }
}
</script>
