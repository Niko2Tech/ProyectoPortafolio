<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">Buscar producto</span>
    </label>
    <input
      ref="searchInput"
      v-model="searchTerm"
      @input="handleSearch"
      @keydown.enter.prevent="buscarPorCodigo"
      type="text"
      placeholder="Buscar por nombre o código de barras..."
      class="input input-bordered w-full mb-2"
    />
    <div class="overflow-x-auto">
      <table
        class="table w-full"
        :class="{ 'min-h-[120px]': paginatedProductos.length < pageSize }"
      >
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>SKU</th>
            <th>Precio</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in paginatedProductos" :key="producto.id">
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.codigoBarras }}</td>
            <td>{{ producto.sku }}</td>
            <td>{{ formatChileanCurrency(Number(producto.precioVenta)) }}</td>
            <td>{{ producto.stockActual }}</td>
            <td>
              <button class="btn btn-sm btn-primary" @click="agregarProducto(producto)">
                <Icon name="mdi:plus" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div class="flex justify-end items-center gap-2 mt-2" v-if="totalPages > 1">
        <button class="btn btn-xs" :disabled="currentPage === 1" @click="currentPage--">
          <Icon name="mdi:chevron-left" />
        </button>
        <span class="text-sm">Página {{ currentPage }} de {{ totalPages }}</span>
        <button class="btn btn-xs" :disabled="currentPage === totalPages" @click="currentPage++">
          <Icon name="mdi:chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Producto } from '~/types/product'
import { formatChileanCurrency } from '#imports'

const emit = defineEmits(['select'])
const productos = ref<Producto[]>([])
const productosFiltrados = ref<Producto[]>([])
const searchTerm = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const pageSize = 5
const currentPage = ref(1)

onMounted(async () => {
  const response = await useApiFetch('/products/all')
  productos.value = response
  productosFiltrados.value = productos.value

  // Autoenfocar input al montar
  searchInput.value?.focus()

  // Reenfocar si se hace clic fuera
  window.addEventListener('click', () => {
    searchInput.value?.focus()
  })
})

function handleSearch() {
  const term = searchTerm.value.toLowerCase()
  if (!term) {
    productosFiltrados.value = productos.value
  } else {
    productosFiltrados.value = productos.value.filter(
      (p) => p.nombre.toLowerCase().includes(term) || p.codigoBarras.toLowerCase().includes(term)
    )
  }
  currentPage.value = 1
}

function buscarPorCodigo() {
  const match = productos.value.find(
    (p) => p.codigoBarras.toLowerCase() === searchTerm.value.toLowerCase()
  )
  if (match) {
    agregarProducto(match)
    searchTerm.value = ''
    productosFiltrados.value = productos.value
  }
}

const totalPages = computed(() =>
  Math.max(1, Math.ceil(productosFiltrados.value.length / pageSize))
)

const paginatedProductos = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return productosFiltrados.value.slice(start, start + pageSize)
})

watch(productosFiltrados, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

function agregarProducto(producto: Producto) {
  emit('select', producto)
}
</script>
