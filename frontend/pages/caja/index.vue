<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useCaja } from '~/stores/caja'
import { ref, onMounted } from 'vue'
import FormAbrirCaja from '@/components/cajaComponent/FormAbrirCaja.vue'
import MovimientosCajaAnterior from '@/components/cajaComponent/MovimientosCajaAnterior.vue'
import CarritoCaja from '@/components/cajaComponent/CarritoCaja.vue'
import BuscadorProductosCaja from '@/components/cajaComponent/BuscadorProductosCaja.vue'
import type { Producto } from '~/types/product'

definePageMeta({ layout: 'internal' })

const user = useUserStore()
const { cajaActual, loading, error, abrirCaja, buscarCajaAbierta } = useCaja()
const movimientosCajaAnterior = ref([])
const carrito = ref<any[]>([])

// SOLUCIÓN 1: Estado local para controlar cuándo mostrar contenido
const isInitialized = ref(false)

onMounted(async () => {
  try {
    await buscarCajaAbierta(user.id!)
  } finally {
    // Marcamos como inicializado independientemente del resultado
    isInitialized.value = true
  }
})

function onAbrirCaja({ montoApertura, comentario }: { montoApertura: number; comentario: string }) {
  abrirCaja({ montoApertura, usuarioId: user.id! })
}

function onSelectProducto(producto: Producto) {
  const existente = carrito.value.find((p) => p.id === producto.id)
  if (existente) {
    existente.cantidad++
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
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="p-2 rounded-lg">
      <h1 class="text-2xl font-semibold mb-6">Caja diaria</h1>

      <!-- SOLUCIÓN 1: Mostrar loading hasta que esté inicializado -->
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
            />
          </div>
          <div class="flex flex-col gap-4">
            <div class="bg-base-100 p-4 rounded-lg h-full">
              <h2 class="text-lg font-semibold mb-4">Listado de productos</h2>
              <BuscadorProductosCaja @select="onSelectProducto" />
            </div>
          </div>
        </template>

        <template v-else>
          <!-- Caja Cerrada -->
          <div class="flex flex-col gap-4">
            <FormAbrirCaja :loading="loading" :error="error" @submit="onAbrirCaja" />
          </div>
          <div class="flex flex-col gap-4">
            <MovimientosCajaAnterior :movimientos="movimientosCajaAnterior" />
          </div>
        </template>
      </div>
    </article>
  </section>
</template>
