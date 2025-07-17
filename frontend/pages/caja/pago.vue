<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiFetch } from '#imports'
import { formatChileanCurrency } from '@/composables/useUtils'
import type { DocumentoVenta } from '@/types/ventaPago'

const route = useRoute()
const router = useRouter()

const venta = ref<DocumentoVenta | null>(null)
const isLoading = ref(true)
const hasError = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  const ventaId = route.query.id

  if (!ventaId) {
    hasError.value = true
    errorMsg.value = 'No se proporcionó ID de venta'
    isLoading.value = false
    return
  }

  try {
    const response = await useApiFetch(`/sales/obtener-venta/${ventaId}`)
    venta.value = response.data || response
  } catch (error) {
    console.error('Error al obtener la venta:', error)
    hasError.value = true
    errorMsg.value = 'Error al cargar la información de la venta'
  } finally {
    isLoading.value = false
  }
})

function handleNuevaVenta() {
  router.push('/caja')
}

function handleImprimir() {
  window.print()
}
</script>

<template>
  <section class="flex flex-col items-center py-2 print:py-0">
    <article
      class="voucher-container w-[80mm] bg-white rounded-lg shadow-none p-2 print:shadow-none print:rounded-none print:bg-white"
    >
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[300px]">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-4 text-gray-500">Cargando información de la venta...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="hasError" class="text-center py-12">
        <div class="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-lg">{{ errorMsg }}</span>
        </div>
        <button class="btn btn-primary btn-lg no-print" @click="handleNuevaVenta">
          Volver a Caja
        </button>
      </div>

      <!-- Success State -->
      <div v-else-if="venta" class="flex flex-col items-center w-full">
        <!-- Encabezado Empresa -->
        <div class="text-center w-full mb-2">
          <h2 class="text-xl font-bold tracking-wide">Ferreteria Carlito</h2>
          <p class="text-sm">Dirección: Arza #1032, Melipilla</p>
        </div>
        <div class="border-b border-gray-300 w-full my-1"></div>
        <!-- Info Boleta -->
        <div class="flex justify-between w-full text-xs py-1">
          <div>
            <p class="font-medium">Comprobante de venta</p>
            <p>N° {{ venta.numeroDocumento }}</p>
          </div>
          <div class="text-right">
            <p>Fecha:</p>
            <p>{{ new Date(venta.fechaEmision).toLocaleDateString('es-CL') }}</p>
            <p class="mt-1">Hora:</p>
            <p>{{ new Date(venta.fechaEmision).toLocaleTimeString('es-CL') }}</p>
          </div>
        </div>
        <div class="border-b border-gray-300 w-full my-1"></div>
        <div class="flex justify-between w-full text-xs py-1">
          <p>Cliente:</p>
          <p>{{ venta.cliente?.nombre || 'Consumidor final' }}</p>
        </div>
        <div class="flex justify-between w-full text-xs py-1">
          <p>Vendedor:</p>
          <p>{{ venta.usuario?.nombre || 'N/A' }}</p>
        </div>
        <div class="flex justify-between w-full text-xs py-1">
          <p>Forma de pago:</p>
          <p>{{ venta.metodoPago?.nombre || 'N/A' }}</p>
        </div>
        <div class="border-b border-gray-300 w-full my-1"></div>
        <!-- Tabla Productos -->
        <table class="w-full text-xs my-2">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left font-normal py-1">Producto</th>
              <th class="text-left font-normal py-1">Cantidad</th>
              <th class="text-center font-normal py-1">P.Unit</th>
              <th class="text-right font-normal py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="detalle in venta.detalles"
              :key="detalle.id"
              class="border-b border-gray-100"
            >
              <td class="py-1 max-w-[70px]">{{ detalle.producto?.nombre || 'Producto' }}</td>
              <td class="text-center py-1">{{ detalle.cantidad }}</td>
              <td class="text-center py-1">
                {{ formatChileanCurrency(Number(detalle.precioUnitario)) }}
              </td>
              <td class="text-right py-1">
                {{ formatChileanCurrency(Number(detalle.totalLinea)) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="border-b border-gray-300 w-full my-1"></div>
        <!-- Totales -->
        <div class="w-full flex flex-col gap-1 text-xs mt-2">
          <div class="flex justify-between">
            <span>Subtotal (Sin IVA):</span>
            <span>{{ formatChileanCurrency(Number(venta.subtotalNeto)) }}</span>
          </div>
          <div class="flex justify-between">
            <span>IVA (19%):</span>
            <span>{{ formatChileanCurrency(Number(venta.montoIva)) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Descuento:</span>
            <span>{{ formatChileanCurrency(0) }}</span>
          </div>
          <div class="flex justify-between font-bold text-base mt-1">
            <span>Total:</span>
            <span>{{ formatChileanCurrency(Number(venta.total)) }}</span>
          </div>
        </div>
        <div class="border-b border-gray-300 w-full my-2"></div>
        <!-- Mensaje de agradecimiento -->
        <div class="w-full text-center mt-2">
          <p class="text-base font-semibold">Gracias por su preferencia</p>
        </div>
        <!-- Botones de acción -->
        <div class="flex justify-center gap-2 pt-4 w-full no-print">
          <button class="btn btn-outline btn-sm" @click="handleImprimir">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir
          </button>
          <button class="btn btn-primary btn-sm" @click="handleNuevaVenta">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva Venta
          </button>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
  .voucher-container {
    position: absolute !important;
    left: 0;
    top: 0;
    width: 80mm !important;
    margin: 0 !important;
    padding: 0.5rem !important;
    background: white !important;
    box-shadow: none !important;
  }
}

.voucher-container {
  width: 80mm;
  margin: 0 auto;
  padding: 0.5rem;
}
</style>
