<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useCaja } from '~/stores/caja'
import { ref, onMounted } from 'vue'
import FormAbrirCaja from '@/components/cajaComponent/FormAbrirCaja.vue'
import MovimientosCajaAnterior from '@/components/cajaComponent/MovimientosCajaAnterior.vue'
import CarritoCaja from '@/components/cajaComponent/CarritoCaja.vue'
import BuscadorProductosCaja from '@/components/cajaComponent/BuscadorProductosCaja.vue'
import type { Producto } from '~/types/product'
import Modal from '~/components/Modal.vue'
import FormularioPago from '~/components/cajaComponent/FormularioPago.vue'
import FromCerrarCaja from '~/components/cajaComponent/FromCerrarCaja.vue'

definePageMeta({ layout: 'internal' })

const user = useUserStore()
const { cajaActual, loading, error, abrirCaja, buscarCajaAbierta, cerrarCaja } = useCaja()
const movimientosCajaAnterior = ref([])
const carrito = ref<any[]>([])

// Estado local para controlar cuándo mostrar contenido
const isInitialized = ref(false)

// NUEVA REF para controlar el buscador
const buscadorRef = ref<{ setFocus: (shouldFocus: boolean) => void } | null>(null)

const showModal = ref(false)

onMounted(async () => {
  try {
    await buscarCajaAbierta(user.id!)
    console.log('cajaActual', cajaActual.value)
  } finally {
    // Marcamos como inicializado independientemente del resultado
    isInitialized.value = true
  }
})

function onAbrirCaja({ montoApertura, comentario }: { montoApertura: number; comentario: string }) {
  abrirCaja({ montoApertura, usuarioId: user.id! })
}

const toastNoStock = ref(false)

function onSelectProducto(producto: Producto) {
  const existente = carrito.value.find((p) => p.id === producto.id)
  if (existente) {
    if (existente.cantidad < producto.stockActual) {
      existente.cantidad++
    } else {
      toastNoStock.value = true
      setTimeout(() => {
        toastNoStock.value = false
      }, 3000)
    }
  } else {
    carrito.value.push({ ...producto, cantidad: 1 })
  }
}

function onUpdateCantidad(item: any) {
  if (item.cantidad < 1) item.cantidad = 1
}

function onVaciarCarrito() {
  carrito.value = []
}

function onEliminarCarrito(item: any) {
  carrito.value = carrito.value.filter((p) => p.id !== item.id)
}

function openModalPago() {
  showModal.value = true
  // Desactivar el focus del buscador cuando se abre el modal
  buscadorRef.value?.setFocus(false)
}

function closeModalPago() {
  showModal.value = false
  // Reactivar el focus del buscador cuando se cierra el modal
  setTimeout(() => {
    buscadorRef.value?.setFocus(true)
  }, 100) // Pequeño delay para que el modal se cierre completamente
}

const showModalCerrarCaja = ref(false)

function closeModalCerrarCaja() {
  showModalCerrarCaja.value = false
  setTimeout(() => {
    buscadorRef.value?.setFocus(true)
  }, 100) // Pequeño delay para que el modal se cierre completamente
}

function openModalCerrarCaja() {
  showModalCerrarCaja.value = true
  buscadorRef.value?.setFocus(false)
}
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="p-2 rounded-lg">
      <h1 class="text-2xl font-semibold mb-6">Caja diaria</h1>

      <!-- Mostrar loading hasta que esté inicializado -->
      <div v-if="!isInitialized || loading" class="flex justify-center items-center min-h-[300px]">
        <div class="text-center">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-4 text-gray-500">Cargando información de caja...</p>
        </div>
      </div>

      <!-- Solo mostrar contenido cuando esté inicializado -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-if="cajaActual">
          <!-- Caja Abierta -->
          <div class="flex flex-col gap-4">
            <CarritoCaja
              :carrito="carrito"
              @update-cantidad="onUpdateCantidad"
              @vaciar-carrito="onVaciarCarrito"
              @eliminar-carrito="onEliminarCarrito"
              @abrir-modal-pago="openModalPago"
            />
          </div>
          <div class="flex flex-col gap-4">
            <div class="bg-base-100 p-4 rounded-lg h-full">
              <h2 class="text-lg font-semibold mb-4">Listado de productos</h2>
              <BuscadorProductosCaja
                ref="buscadorRef"
                :disabled="showModal || showModalCerrarCaja"
                @select="onSelectProducto"
              />
              <div class="flex justify-end mt-4">
                <button class="btn btn-soft btn-info" @click="openModalCerrarCaja()">
                  Cerrar caja
                </button>
              </div>
            </div>
          </div>
          <Modal title="Formulario de Pago" :visible="showModal" @update:visible="closeModalPago">
            <FormularioPago :carrito="carrito" @cancelar="closeModalPago" />
          </Modal>
          <Modal
            title="Cerrar caja"
            :visible="showModalCerrarCaja"
            @update:visible="closeModalCerrarCaja"
          >
            <FromCerrarCaja />
          </Modal>
          <div class="toast" v-if="toastNoStock">
            <div class="alert alert-info">
              <span>Stock insuficiente.</span>
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Caja Cerrada -->
          <div class="bg-base-100 p-4 rounded-lg h-full flex flex-col gap-4">
            <FormAbrirCaja :loading="loading" :error="error" @submit="onAbrirCaja" />
          </div>
          <div class="bg-base-100 p-4 rounded-lg h-full flex flex-col gap-4">
            <MovimientosCajaAnterior />
          </div>
        </template>
      </div>
    </article>
  </section>
</template>
