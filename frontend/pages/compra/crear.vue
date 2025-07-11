<script setup lang="ts">
definePageMeta({
  layout: 'internal',
})

import { useApiFetch } from '#imports'
import type { Compra, CompraDetalle } from '~/types/purchases'
import type { Producto } from '~/types/product'
import type { Suppliers } from '~/types/suppliers'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const messageSuccess = ref('')
const messageError = ref('')
const proveedorList = ref<Suppliers[]>([])
const productosList = ref<Producto[]>([])
const productosFiltrados = ref<Producto[]>([])
const searchTerm = ref('')
const selectedProduct = ref<Producto | null>(null)
const showProductDropdown = ref(false)

const compra = ref<Omit<Compra, 'id' | 'createdAt' | 'updatedAt'>>({
  tipoDocumento: 'factura',
  numeroDocumento: '',
  proveedorId: '',
  fechaEmision: new Date().toISOString().split('T')[0],
  fechaRecepcion: new Date().toISOString().split('T')[0],
  subtotalNeto: 0,
  montoIva: 0,
  total: 0,
  estado: 'pagada',
  detalles: [],
  usuarioId: userStore.usuario?.id || '',
})

const nuevoDetalle = ref<Omit<CompraDetalle, 'totalLinea'>>({
  productoId: '',
  cantidad: 1,
  costoUnitario: 0,
})

onMounted(async () => {
  try {
    const [proveedores, productos] = await Promise.all([
      useApiFetch('/suppliers'),
      useApiFetch('/products'),
    ])
    // Manejar tanto respuestas paginadas como arrays directos
    proveedorList.value = Array.isArray(proveedores) ? proveedores : proveedores.data || []
    productosList.value = Array.isArray(productos) ? productos : productos.data || []
  } catch (error: any) {
    messageError.value = 'Error al cargar datos iniciales.'
  }
})

// Buscador de productos
const handleProductSearch = () => {
  if (!searchTerm.value.trim()) {
    productosFiltrados.value = []
    showProductDropdown.value = false
    return
  }

  const term = searchTerm.value.toLowerCase()
  productosFiltrados.value = productosList.value.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(term) ||
      producto.sku.toLowerCase().includes(term) ||
      producto.codigoBarras.toLowerCase().includes(term)
  )
  showProductDropdown.value = productosFiltrados.value.length > 0
}

const selectProduct = (producto: Producto) => {
  selectedProduct.value = producto
  nuevoDetalle.value.productoId = producto.id
  nuevoDetalle.value.costoUnitario = parseFloat(producto.costoNeto)
  searchTerm.value = producto.nombre
  showProductDropdown.value = false
}

const agregarProducto = () => {
  if (
    !selectedProduct.value ||
    nuevoDetalle.value.cantidad <= 0 ||
    nuevoDetalle.value.costoUnitario <= 0
  ) {
    messageError.value = 'Por favor complete todos los campos del producto.'
    return
  }

  // Verificar si el producto ya existe en la lista
  const productoExistente = compra.value.detalles.find(
    (detalle) => detalle.productoId === selectedProduct.value!.id
  )

  if (productoExistente) {
    messageError.value = 'Este producto ya está en la lista.'
    return
  }

  const totalLinea = nuevoDetalle.value.cantidad * nuevoDetalle.value.costoUnitario

  compra.value.detalles.push({
    ...nuevoDetalle.value,
    totalLinea,
  })

  // Limpiar formulario de nuevo producto
  selectedProduct.value = null
  nuevoDetalle.value = {
    productoId: '',
    cantidad: 1,
    costoUnitario: 0,
  }
  searchTerm.value = ''
  productosFiltrados.value = []
  showProductDropdown.value = false
  messageError.value = ''

  calcularTotales()
}

const eliminarProducto = (index: number) => {
  compra.value.detalles.splice(index, 1)
  calcularTotales()
}

const calcularTotales = () => {
  const subtotal = compra.value.detalles.reduce((sum, detalle) => sum + detalle.totalLinea, 0)
  compra.value.subtotalNeto = subtotal
  compra.value.montoIva = subtotal * 0.19 // 19% IVA
  compra.value.total = subtotal + compra.value.montoIva
}

const handleSubmit = async (event: Event) => {
  event.preventDefault()

  if (compra.value.detalles.length === 0) {
    messageError.value = 'Debe agregar al menos un producto a la compra.'
    return
  }

  try {
    await useApiFetch('/purchases', {
      method: 'POST',
      body: compra.value,
    })

    messageSuccess.value = 'Compra creada exitosamente.'
    messageError.value = ''

    // Reiniciar el formulario
    compra.value = {
      tipoDocumento: 'factura',
      numeroDocumento: '',
      proveedorId: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaRecepcion: new Date().toISOString().split('T')[0],
      subtotalNeto: 0,
      montoIva: 0,
      total: 0,
      estado: 'pagada',
      detalles: [],
      usuarioId: '',
    }
    selectedProduct.value = null
    nuevoDetalle.value = {
      productoId: '',
      cantidad: 1,
      costoUnitario: 0,
    }
    searchTerm.value = ''
  } catch (error: any) {
    console.error('Error al crear compra:', error)
    messageError.value = error?.data?.message || 'Ocurrió un error al crear la compra.'
    messageSuccess.value = ''
  }
}

// Observar cambios en los detalles para recalcular totales
watch(() => compra.value.detalles, calcularTotales, { deep: true })
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 shadow-md p-6 rounded-lg">
      <h1 class="text-2xl font-semibold mb-6">Crear Compra</h1>

      <p v-if="messageSuccess" class="text-success text-lg mb-4">
        {{ messageSuccess }}
      </p>
      <p v-if="messageError" class="text-error text-lg mb-4">
        {{ messageError }}
      </p>

      <form @submit="handleSubmit" class="space-y-6">
        <!-- Información del documento -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="form-control w-full floating-label">
            <span>Tipo de documento</span>
            <select v-model="compra.tipoDocumento" class="select select-bordered w-full" required>
              <option value="factura">Factura</option>
              <option value="boleta">Boleta</option>
              <option value="otro">Otro</option>
            </select>
          </label>

          <label class="form-control w-full floating-label">
            <span>Número de documento</span>
            <input
              v-model="compra.numeroDocumento"
              type="text"
              class="input input-bordered w-full"
              required
            />
          </label>

          <label class="form-control w-full floating-label">
            <span>Proveedor</span>
            <select v-model="compra.proveedorId" class="select select-bordered w-full" required>
              <option disabled value="">Seleccione proveedor</option>
              <option v-for="prov in proveedorList" :key="prov.id" :value="prov.id">
                {{ prov.nombreFantasia }}
              </option>
            </select>
          </label>
        </div>

        <!-- Fechas y Estado -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label class="form-control w-full floating-label">
            <span>Fecha de emisión</span>
            <input
              v-model="compra.fechaEmision"
              type="date"
              class="input input-bordered w-full"
              required
            />
          </label>

          <label class="form-control w-full floating-label">
            <span>Fecha de recepción</span>
            <input
              v-model="compra.fechaRecepcion"
              type="date"
              class="input input-bordered w-full"
              required
            />
          </label>

          <label class="form-control w-full floating-label">
            <span>Estado de la compra</span>
            <select v-model="compra.estado" class="select select-bordered w-full" required>
              <option value="pendiente">Pendiente</option>
              <option value="recibida">Recibida</option>
              <option value="pagada">Pagada</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
        </div>

        <!-- Agregar productos -->
        <div class="border-2 border-dashed border-base-300 p-4 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Agregar Productos</h3>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <!-- Buscador de productos -->
            <div class="form-control w-full relative">
              <span class="label-text mb-2">Buscar producto</span>
              <input
                v-model="searchTerm"
                @input="handleProductSearch"
                @focus="showProductDropdown = true"
                type="text"
                placeholder="Buscar por nombre, SKU o código de barras..."
                class="input input-bordered w-full"
              />

              <!-- Dropdown de productos -->
              <div
                v-if="showProductDropdown && productosFiltrados.length > 0"
                class="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <div
                  v-for="producto in productosFiltrados"
                  :key="producto.id"
                  @click="selectProduct(producto)"
                  class="p-3 hover:bg-base-200 cursor-pointer border-b border-base-300 last:border-b-0"
                >
                  <div class="font-medium">{{ producto.nombre }}</div>
                  <div class="text-sm text-base-content/70">
                    SKU: {{ producto.sku }} | Stock: {{ producto.stockActual }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Cantidad -->
            <label class="form-control w-full">
              <span>Cantidad</span>
              <input
                v-model.number="nuevoDetalle.cantidad"
                type="number"
                min="1"
                class="input input-bordered w-full"
              />
            </label>

            <!-- Costo unitario -->
            <label class="form-control w-full">
              <span>Costo unitario</span>
              <input
                v-model.number="nuevoDetalle.costoUnitario"
                type="number"
                min="0"
                step="0.01"
                class="input input-bordered w-full"
              />
            </label>

            <!-- Botón agregar -->
            <div class="flex items-end">
              <button
                type="button"
                @click="agregarProducto"
                class="btn btn-primary w-full"
                :disabled="
                  !selectedProduct || nuevoDetalle.cantidad <= 0 || nuevoDetalle.costoUnitario <= 0
                "
              >
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Lista de productos -->
        <div v-if="compra.detalles.length > 0" class="border border-base-300 rounded-lg">
          <div class="bg-base-200 p-4 font-semibold">Productos de la compra</div>

          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Cantidad</th>
                  <th>Costo unitario</th>
                  <th>Total línea</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(detalle, index) in compra.detalles" :key="index">
                  <td>
                    {{ productosList.find((p) => p.id === detalle.productoId)?.nombre }}
                  </td>
                  <td>
                    {{ productosList.find((p) => p.id === detalle.productoId)?.sku }}
                  </td>
                  <td>{{ detalle.cantidad }}</td>
                  <td>${{ detalle.costoUnitario.toLocaleString() }}</td>
                  <td>${{ detalle.totalLinea.toLocaleString() }}</td>
                  <td>
                    <button
                      type="button"
                      @click="eliminarProducto(index)"
                      class="btn btn-sm btn-error"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totales -->
        <div v-if="compra.detalles.length > 0" class="bg-base-200 p-4 rounded-lg">
          <div class="flex justify-end space-x-4 text-lg">
            <div>
              <span class="font-semibold">Subtotal neto:</span>
              <span class="ml-2">${{ compra.subtotalNeto.toLocaleString() }}</span>
            </div>
            <div>
              <span class="font-semibold">IVA (19%):</span>
              <span class="ml-2">${{ compra.montoIva.toLocaleString() }}</span>
            </div>
            <div class="text-xl font-bold">
              <span>Total:</span>
              <span class="ml-2">${{ compra.total.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Botón submit -->
        <div class="flex justify-end">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            :disabled="compra.detalles.length === 0"
          >
            Crear Compra
          </button>
        </div>
      </form>
    </article>
  </section>
</template>
