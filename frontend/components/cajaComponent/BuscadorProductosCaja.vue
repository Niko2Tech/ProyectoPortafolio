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

// NUEVA PROP para controlar el focus
const props = defineProps<{
  disabled?: boolean
}>()

const productos = ref<Producto[]>([])
const productosFiltrados = ref<Producto[]>([])
const searchTerm = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const pageSize = 5
const currentPage = ref(1)

onMounted(async () => {
  const response = await useApiFetch('/products/all')
  productos.value = response
  productosFiltrados.value = []

  // Solo auto-enfocar si no está deshabilitado
  if (!props.disabled) {
    searchInput.value?.focus()
  }
})

// Función para manejar el focus
function handleFocus() {
  if (!props.disabled) {
    searchInput.value?.focus()
  }
}

// Función pública para enfocar/desenfocar
function setFocus(shouldFocus: boolean) {
  if (shouldFocus && !props.disabled) {
    searchInput.value?.focus()
  } else {
    searchInput.value?.blur()
  }
}

// Exponer la función para uso externo
defineExpose({
  setFocus,
})

// Watcher para controlar el focus cuando cambia la prop disabled
watch(
  () => props.disabled,
  (newVal) => {
    if (newVal) {
      searchInput.value?.blur()
    } else {
      // Retrasar el focus para que el modal se cierre completamente
      setTimeout(() => {
        searchInput.value?.focus()
      }, 100)
    }
  }
)

// Manejar clicks para reactivar focus solo si no está deshabilitado
function handleWindowClick() {
  if (!props.disabled) {
    searchInput.value?.focus()
  }
}

// Configurar el event listener condicionalmente
watch(
  () => props.disabled,
  (newVal) => {
    if (newVal) {
      window.removeEventListener('click', handleWindowClick)
    } else {
      window.addEventListener('click', handleWindowClick)
    }
  },
  { immediate: true }
)

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
  // Solo procesar si no está deshabilitado
  if (props.disabled) return

  const match = productos.value.find(
    (p) => p.codigoBarras.toLowerCase() === searchTerm.value.toLowerCase()
  )
  if (match) {
    agregarProducto(match)
    searchTerm.value = ''
    productosFiltrados.value = []
  } else {
    searchTerm.value = ''
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
  productosFiltrados.value = []
  searchTerm.value = ''
}
</script>
