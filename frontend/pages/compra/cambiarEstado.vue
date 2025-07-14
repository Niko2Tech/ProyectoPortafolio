<script setup lang="ts">
definePageMeta({
  layout: 'internal',
})

import { useApiFetch } from '#imports'
import type { CompraEditCambiarEstado, EstadoCompra } from '~/types/purchases'
import { useUserStore } from '@/stores/user'
import type { Producto } from '~/types/product'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const compraId = route.query.id as string
const messageSuccess = ref('')
const messageError = ref('')
const messageErrorData = ref('')
const loading = ref(false)
const compra = ref<CompraEditCambiarEstado | null>(null)
const nuevoEstado = ref<EstadoCompra>('pendiente')
const productosList = ref<Producto[]>([])

// Estados disponibles con sus etiquetas
const estadosDisponibles = {
  pendiente: 'Pendiente',
  recibida: 'Recibida',
  pagada: 'Pagada',
  anulada: 'Anulada',
}

// Función para obtener estados disponibles basado en el estado actual
const getEstadosDisponibles = (estadoActual: EstadoCompra) => {
  const estados = Object.entries(estadosDisponibles)

  // Filtrar estados ya marcados
  return estados.filter(([key]) => key !== estadoActual)
}

// Función para formatear fecha
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-CL')
}

// Cargar datos de la compra
onMounted(async () => {
  if (!compraId) {
    messageErrorData.value = 'Debe seleccionar una compra'
    return
  }

  try {
    loading.value = true

    // Cargar productos con manejo de errores
    const productosResponse = await useApiFetch('/products')

    // Verificar si la respuesta es un array o contiene un array
    if (Array.isArray(productosResponse)) {
      productosList.value = productosResponse
    } else if (productosResponse && typeof productosResponse === 'object') {
      // Si la respuesta es un objeto, buscar el array en diferentes propiedades comunes
      if (Array.isArray(productosResponse.data)) {
        productosList.value = productosResponse.data
      } else if (Array.isArray(productosResponse.productos)) {
        productosList.value = productosResponse.productos
      } else if (Array.isArray(productosResponse.items)) {
        productosList.value = productosResponse.items
      } else {
        console.error('Estructura de respuesta de productos no reconocida:', productosResponse)
        productosList.value = []
      }
    } else {
      console.error('Respuesta de productos no válida:', productosResponse)
      productosList.value = []
    }

    // Cargar datos de la compra
    const response = await useApiFetch(`/purchases/${compraId}`)
    compra.value = response
    nuevoEstado.value = response.estado
  } catch (error: any) {
    messageError.value = 'Error al cargar los datos de la compra'
    console.error('Error:', error)
    productosList.value = [] // Asegurar que sea un array vacío en caso de error
  } finally {
    loading.value = false
  }
})

// Función para cambiar el estado
const cambiarEstado = async () => {
  if (!compra.value || !userStore.usuario?.id) {
    messageError.value = 'Error: datos incompletos'
    return
  }

  try {
    loading.value = true

    await useApiFetch(`/purchases/${compraId}/status`, {
      method: 'PATCH',
      body: {
        estado: nuevoEstado.value,
        usuarioId: userStore.usuario.id,
      },
    })

    messageSuccess.value = 'Estado de compra actualizado exitosamente'
    messageError.value = ''

    // Actualizar el estado local
    compra.value.estado = nuevoEstado.value

    // Redirigir después de un breve delay
    setTimeout(() => {
      router.push('/compra')
    }, 2000)
  } catch (error: any) {
    messageError.value = error?.data?.message || 'Error al actualizar el estado de la compra'
    messageSuccess.value = ''
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

// Computed para verificar si el estado seleccionado es diferente al actual
const estadoCambiado = computed(() => {
  return compra.value && nuevoEstado.value !== compra.value.estado
})

// Función mejorada para obtener producto con validación
const getProducto = (id: string) => {
  // Verificar que productosList sea un array antes de usar find
  if (!Array.isArray(productosList.value)) {
    return null
  }

  return productosList.value.find((p) => p.id === id) || null
}
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 shadow-md p-6 rounded-lg">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">Cambiar estado de compra</h1>
        <button @click="router.push('/compra')" class="btn btn-outline btn-sm">
          Volver a compras
        </button>
      </div>

      <div v-if="messageErrorData">
        <p class="text-error text-lg mb-4">
          {{ messageErrorData }}
        </p>
      </div>

      <div v-else-if="loading || !compra" class="flex justify-center items-center py-8">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else>
        <p v-if="messageSuccess" class="text-success text-lg mb-4">
          {{ messageSuccess }}
        </p>
        <p v-if="messageError" class="text-error text-lg mb-4">
          {{ messageError }}
        </p>

        <!-- Información de la compra (solo lectura) -->
        <div class="space-y-6">
          <!-- Información del documento -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label class="form-control w-full">
              <span class="label-text">Tipo de documento</span>
              <input
                :value="
                  compra.tipoDocumento === 'factura'
                    ? 'Factura'
                    : compra.tipoDocumento === 'boleta'
                      ? 'Boleta'
                      : 'Otro'
                "
                class="input input-bordered w-full"
                disabled
              />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Número de documento</span>
              <input :value="compra.numeroDocumento" class="input input-bordered w-full" disabled />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Proveedor</span>
              <input
                :value="compra.proveedor.nombreFantasia"
                class="input input-bordered w-full"
                disabled
              />
            </label>
          </div>

          <!-- Fechas y Usuario -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label class="form-control w-full">
              <span class="label-text">Fecha de emisión</span>
              <input
                :value="formatDate(compra.fechaEmision)"
                class="input input-bordered w-full"
                disabled
              />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Fecha de recepción</span>
              <input
                :value="formatDate(compra.fechaRecepcion)"
                class="input input-bordered w-full"
                disabled
              />
            </label>

            <label class="form-control w-full">
              <span class="label-text">Creado por</span>
              <input :value="compra.usuario.nombre" class="input input-bordered w-full" disabled />
            </label>
          </div>

          <!-- Productos de la compra -->
          <div class="border border-base-300 rounded-lg">
            <div class="bg-base-200 p-4 font-semibold">Productos de la compra</div>

            <div class="overflow-x-auto">
              <table class="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Unidad</th>
                    <th>Cantidad</th>
                    <th>Costo unitario</th>
                    <th>Total línea</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="detalle in compra.detalles" :key="detalle.productoId">
                    <td>
                      {{ getProducto(detalle.productoId)?.nombre || 'Producto no encontrado' }}
                    </td>
                    <td>{{ getProducto(detalle.productoId)?.sku || 'N/A' }}</td>
                    <td>{{ getProducto(detalle.productoId)?.unidadMedida || 'N/A' }}</td>
                    <td>{{ detalle.cantidad }}</td>
                    <td>${{ Number(detalle.costoUnitario).toLocaleString() }}</td>
                    <td>${{ Number(detalle.totalLinea).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totales -->
          <div class="bg-base-200 p-4 rounded-lg">
            <div class="flex justify-end space-x-4 text-lg">
              <div>
                <span class="font-semibold">Subtotal neto:</span>
                <span class="ml-2">${{ Number(compra.subtotalNeto).toLocaleString() }}</span>
              </div>
              <div>
                <span class="font-semibold">IVA (19%):</span>
                <span class="ml-2">${{ Number(compra.montoIva).toLocaleString() }}</span>
              </div>
              <div class="text-xl font-bold">
                <span>Total:</span>
                <span class="ml-2">${{ Number(compra.total).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Cambio de estado -->
          <div class="border-2 border-dashed border-primary p-6 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">Cambiar Estado</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label class="form-control w-full">
                <span class="label-text">Estado actual</span>
                <input
                  :value="estadosDisponibles[compra.estado]"
                  class="input input-bordered w-full"
                  disabled
                />
              </label>

              <label class="form-control w-full">
                <span class="label-text">Nuevo estado</span>
                <select
                  v-model="nuevoEstado"
                  class="select select-bordered w-full"
                  :disabled="loading"
                >
                  <option :value="compra.estado" disabled>
                    {{ estadosDisponibles[compra.estado] }}
                  </option>
                  <option
                    v-for="[key, label] in getEstadosDisponibles(compra.estado)"
                    :key="key"
                    :value="key"
                  >
                    {{ label }}
                  </option>
                </select>
              </label>
            </div>

            <!-- Información importante -->
            <div class="alert alert-info mb-4">
              <Icon name="mdi:information-outline" class="w-6 h-6" />
              <div>
                <p class="font-semibold">Información importante:</p>
                <p>
                  Si desea agregar el inventario de esta compra al stock, debe colocar el estado
                  como "Recibida".
                </p>
              </div>
            </div>

            <!-- Botón para cambiar estado -->
            <div class="flex justify-end">
              <button
                @click="cambiarEstado"
                class="btn btn-primary"
                :disabled="!estadoCambiado || loading"
              >
                <span v-if="loading" class="loading loading-spinner loading-sm"></span>
                {{ loading ? 'Actualizando...' : 'Cambiar Estado' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
