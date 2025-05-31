<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useApiComponent } from '@/composables/useApiComponent'
import type { PaginatedResponse, PaginationMeta } from '~/types/api'
import type { Producto } from '~/types/product'
import { InventarioComponentDataIndexInventario } from '#components'
import { formatChileanCurrency } from '#imports'

definePageMeta({
  layout: 'internal',
})

const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const limit = ref(10)

const search = ref(route.query.search || '')
const debouncedSearch = ref(search.value)
let debounceTimer: NodeJS.Timeout

const {
  data: response,
  pending,
  error,
} = useApiComponent<PaginatedResponse<Producto>>('/products', {
  query: {
    page,
    limit,
    search: debouncedSearch,
  },
  key: computed(
    () => `productos-page-${page.value}-limit-${limit.value}-search-${debouncedSearch.value}`
  ),
})

const visibleProductos = ref<Producto[]>([])
const visibleMeta = ref<PaginationMeta>({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: limit.value,
  totalPages: 1,
  currentPage: page.value,
})

watch(
  () => response.value,
  (newData) => {
    if (newData) {
      visibleProductos.value = newData.data
      visibleMeta.value = newData.meta
    }
  },
  { immediate: true }
)

watch(limit, (newLimit, oldLimit) => {
  if (newLimit !== oldLimit) {
    page.value = 1 // reiniciar paginación
  }
})

watch(search, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = val
    page.value = 1 // Reiniciar página al buscar
  }, 400) // espera 400ms tras dejar de escribir
})

watchEffect(() => {
  if (Number(route.query.page) !== page.value) {
    router.replace({ query: { ...route.query, page: page.value } })
  }
})

function setPage(i: number) {
  page.value = i
}

function decrementPage() {
  if (page.value > 1) page.value--
}

function incrementPage() {
  if (page.value < visibleMeta.value.totalPages) page.value++
}

const paginationRange = computed(() => {
  const current = page.value
  const total = visibleMeta.value.totalPages
  const range: (number | string)[] = []

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  range.push(1)
  if (current > 3) range.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(current + 1, total - 1)
  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  if (current < total - 2) range.push('...')
  range.push(total)

  return range
})
</script>

<template>
  <section class="md:p-4 p-1">
    <InventarioComponentDataIndexInventario />
  </section>

  <section class="md:p-4 p-1">
    <div
      class="bg-base-100 shadow-md p-4 rounded-lg transition-opacity duration-300"
      :class="{ 'opacity-50 pointer-events-none': pending }"
    >
      <!-- Header -->
      <div class="flex flex-row justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Productos</h1>
        <button class="btn btn-dash btn-primary" @click="router.push('/inventario/crear')">
          <Icon name="mdi:plus" class="mr-2" />
          Agregar Producto
        </button>
      </div>
      <!-- Header tabla -->
      <div class="flex flex-row justify-between items-center mb-4">
        <div>
          <select class="select" v-model.number="limit">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div>
          <label class="input">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input type="search" class="grow" placeholder="Buscador" v-model="search" />
          </label>
        </div>
      </div>
      <!-- Tabla -->
      <div class="overflow-x-auto">
        <table class="table w-full text-sm">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock actual</th>
              <th>Stock minimo</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="producto in visibleProductos"
              :key="producto.id"
              class="hover:bg-gray-100 transition-colors duration-150"
            >
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.sku }}</td>
              <td>{{ formatChileanCurrency(Number(producto.precioVenta)) }}</td>
              <td
                :class="{
                  'text-error': producto.stockActual === 0,
                  'text-warning':
                    producto.stockActual > 0 && producto.stockActual < producto.stockMinimo,
                  'text-success': producto.stockActual >= producto.stockMinimo,
                }"
              >
                {{ producto.stockActual }}
              </td>
              <td>
                {{ producto.stockMinimo }}
              </td>
              <td>{{ producto.marca.nombre }}</td>
              <td>{{ producto.categoria.nombre }}</td>
              <td>{{ producto.proveedor.nombreFantasia }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="flex flex-row justify-between items-center mt-4 gap-1">
        <p class="text-sm text-gray-500 mb-2">
          Mostrando {{ (page - 1) * limit + 1 }} a
          {{ Math.min(page * limit, visibleMeta.totalItems) }} de {{ visibleMeta.totalItems }}
        </p>
        <div class="flex flex-row justify-center items-center mt-4 gap-1">
          <button @click="decrementPage" :disabled="page === 1" class="btn btn-sm">
            <Icon name="mdi:chevron-left" />
          </button>
          <div v-for="item in paginationRange" :key="item">
            <button
              v-if="typeof item === 'number'"
              @click="setPage(item)"
              class="btn btn-sm"
              :class="{ 'btn-primary': item === page }"
            >
              {{ item }}
            </button>
            <span v-else class="mx-1 text-sm">...</span>
          </div>
          <button
            @click="incrementPage"
            :disabled="page === visibleMeta.totalPages"
            class="btn btn-sm"
          >
            <Icon name="mdi:chevron-right" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-base-100 shadow-md p-4 rounded-lg mt-4">
      <div role="alert" class="alert alert-error">
        <Icon name="mdi:alert" class="text-lg" />
        <span class="text-lg">Error al cargar los datos. Por favor, contactar a soporte.</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
