<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { productoCarrito } from '~/types/sales'
import type { metodoPago } from '~/types/payMethod'
import type { CrearVenta, CrearVentaDetalle } from '~/types/sales'
import { useApiFetch } from '#imports'
import { formatChileanCurrency } from '@/composables/useUtils'
import { useUserStore } from '@/stores/user' // Ajusta la ruta según tu estructura

const props = defineProps<{ carrito: productoCarrito[] }>()

// Definir los emits
const emit = defineEmits<{
  cancelar: []
}>()

const userStore = useUserStore()
const router = useRouter()

const metodosPago = ref<metodoPago[]>([])
const metodoPagoId = ref<number | null>(null)
const montoPagado = ref<number>(0)
const showError = ref(false)
const errorMsg = ref('')
const isProcessing = ref(false)

const efectivoCodigos = ['EFECTIVO']
const noVueltoCodigos = ['TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA']

onMounted(async () => {
  const response = await useApiFetch('/pay-method')
  metodosPago.value = Array.isArray(response) ? response : response.data || []
})

const total = computed(() => {
  return props.carrito.reduce(
    (acc, item) => acc + Math.round(Number(item.precioVenta)) * item.cantidad,
    0
  )
})

const valorSinIVA = computed(() => {
  // Redondear hacia abajo
  return Math.floor(total.value / 1.19)
})

const iva = computed(() => {
  return total.value - valorSinIVA.value
})

const descuento = computed(() => 0)

const metodoSeleccionado = computed(() => {
  return metodosPago.value.find((m) => m.id === metodoPagoId.value)
})

const esEfectivo = computed(() => {
  return metodoSeleccionado.value && efectivoCodigos.includes(metodoSeleccionado.value.codigo)
})

const esNoVuelto = computed(() => {
  return metodoSeleccionado.value && noVueltoCodigos.includes(metodoSeleccionado.value.codigo)
})

// Redondeo chileno para vuelto
function redondearVuelto(vuelto: number) {
  const resto = vuelto % 10
  if (resto === 0) return vuelto
  if (resto >= 6) return vuelto + (10 - resto)
  if (resto <= 5 && resto > 0) return vuelto - resto
  return vuelto
}

const vuelto = computed(() => {
  if (!esEfectivo.value) return 0
  const v = montoPagado.value - total.value
  if (v <= 0) return 0
  return redondearVuelto(v)
})

const botonesRapidos = [100, 500, 1000, 2000, 5000, 10000, 20000]

function agregarMonto(agregar: number) {
  montoPagado.value += agregar
}

function limpiarMonto() {
  montoPagado.value = 0
}

watch(metodoPagoId, () => {
  if (esNoVuelto.value) {
    montoPagado.value = total.value
  } else {
    montoPagado.value = 0
  }
})

// Función para crear los detalles de la venta
function crearDetallesVenta(): CrearVentaDetalle[] {
  return props.carrito.map((item) => ({
    productoId: item.id.toString(),
    cantidad: item.cantidad,
    precioUnitario: Math.round(Number(item.precioVenta)),
    descuentoPorcentaje: 0, // Puedes ajustar esto según tu lógica
    totalLinea: Math.round(Number(item.precioVenta)) * item.cantidad,
  }))
}

async function handlePagar() {
  showError.value = false
  errorMsg.value = ''
  isProcessing.value = true

  try {
    // Validaciones
    if (!metodoPagoId.value) {
      showError.value = true
      errorMsg.value = 'Seleccione un método de pago.'
      return
    }

    if (esEfectivo.value && montoPagado.value < total.value) {
      showError.value = true
      errorMsg.value = 'El monto pagado es insuficiente.'
      return
    }

    // Crear el objeto de venta (solo boleta)
    const ventaData: CrearVenta = {
      tipoDocumento: 'boleta',
      usuarioId: userStore.id!, // Ajusta según tu store
      fechaEmision: new Date().toISOString(),
      subtotalNeto: valorSinIVA.value,
      montoIva: iva.value,
      total: total.value,
      metodoPagoId: metodoPagoId.value,
      estado: 'pagada',
      detalles: crearDetallesVenta(),
    }

    // Enviar al backend
    const response = await useApiFetch('/sales/procesar-venta', {
      method: 'POST',
      body: ventaData,
    })

    // Navegar a la página de confirmación con el ID de la venta
    await router.push(`/caja/pago?id=${response.id}`)
  } catch (error) {
    console.error('Error al procesar la venta:', error)
    showError.value = true
    errorMsg.value = 'Error al procesar la venta. Intente nuevamente.'
  } finally {
    isProcessing.value = false
  }
}

function handleCancelar() {
  emit('cancelar')
}
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 p-8 rounded-lg max-w-4xl w-full mx-auto text-lg">
      <h2 class="text-2xl font-semibold mb-6">Detalle de pago</h2>
      <form class="space-y-8" @submit.prevent="handlePagar">
        <!-- Método de pago -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label class="form-control w-full floating-label">
            <span class="text-xl">Forma de pago</span>
            <select
              v-model="metodoPagoId"
              class="select select-bordered select-lg w-full text-lg"
              required
            >
              <option disabled value="">Seleccione un tipo de pago</option>
              <option v-for="m in metodosPago" :key="m.id" :value="m.id">{{ m.nombre }}</option>
            </select>
          </label>
        </div>

        <!-- Totales -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <label class="form-control w-full floating-label">
            <span class="text-xl">Valor sin IVA</span>
            <input
              :value="formatChileanCurrency(valorSinIVA)"
              class="input input-bordered input-lg w-full text-lg"
              readonly
            />
          </label>
          <label class="form-control w-full floating-label">
            <span class="text-xl">IVA</span>
            <input
              :value="formatChileanCurrency(iva)"
              class="input input-bordered input-lg w-full text-lg"
              readonly
            />
          </label>
          <label class="form-control w-full floating-label">
            <span class="text-xl">Descuento</span>
            <input
              :value="formatChileanCurrency(descuento)"
              class="input input-bordered input-lg w-full text-lg"
              readonly
            />
          </label>
          <label class="form-control w-full floating-label">
            <span class="text-xl font-bold">Total a pagar</span>
            <input
              :value="formatChileanCurrency(total)"
              class="input input-bordered input-lg w-full font-bold text-xl bg-yellow-300"
              readonly
            />
          </label>
        </div>

        <!-- Pago y vuelto -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <label class="form-control w-full floating-label" v-if="esEfectivo">
            <span class="text-xl">Monto pagado $</span>
            <input
              v-model.number="montoPagado"
              type="number"
              min="0"
              class="input input-bordered input-lg w-full font-bold text-xl"
            />
          </label>
          <label class="form-control w-full floating-label" v-else>
            <span class="text-xl">Monto pagado $</span>
            <input
              :value="formatChileanCurrency(total)"
              class="input input-bordered input-lg w-full font-bold text-xl"
              readonly
            />
          </label>
          <label class="form-control w-full floating-label" v-if="esEfectivo">
            <span class="text-xl">Vuelto</span>
            <input
              :value="formatChileanCurrency(vuelto)"
              class="input input-bordered input-lg w-full text-lg"
              readonly
            />
          </label>
        </div>

        <!-- Botones rápidos -->
        <div class="flex flex-wrap gap-4 mb-4 min-h-[64px] items-center">
          <template v-if="esEfectivo">
            <button
              v-for="b in botonesRapidos"
              :key="b"
              type="button"
              class="btn btn-lg btn-outline text-lg text-black"
              @click="agregarMonto(b)"
              :disabled="isProcessing"
            >
              ${{ b.toLocaleString() }}
            </button>
            <button
              type="button"
              class="btn btn-lg btn-warning text-lg"
              @click="limpiarMonto"
              :disabled="isProcessing"
            >
              x
            </button>
          </template>
        </div>

        <!-- Mensajes de error -->
        <div v-if="showError === true" class="alert alert-error text-xl py-4">{{ errorMsg }}</div>

        <!-- Botones de acción -->
        <div class="flex justify-end gap-6 mt-8">
          <button
            type="button"
            class="btn btn-outline btn-lg text-lg"
            @click="handleCancelar"
            :disabled="isProcessing"
          >
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary btn-lg text-lg" :disabled="isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isProcessing ? 'Procesando...' : 'Pagar' }}
          </button>
        </div>
      </form>
    </article>
  </section>
</template>
