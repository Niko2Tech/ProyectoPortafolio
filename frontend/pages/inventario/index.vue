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
const search = ref(
  Array.isArray(route.query.search) ? route.query.search[0] || '' : route.query.search || ''
)

const {
  data: response,
  pending,
  error,
} = useApiComponent<PaginatedResponse<Producto>>('/products', {
  query: {
    page,
    limit,
    search,
  },
  key: computed(() => `productos-page-${page.value}-limit-${limit.value}-search-${search.value}`),
})

const visibleProductos = ref<Producto[]>([])
const visibleMeta = ref<PaginationMeta>({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: limit.value,
  totalPages: 1,
  currentPage: page.value,
})

// Configuración de columnas para la tabla
const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'codigoBarras', label: 'Código de barras' },
  {
    key: 'precioVenta',
    label: 'Precio venta',
    formatter: (value: any) => formatChileanCurrency(Number(value)),
  },
  {
    key: 'stockActual',
    label: 'Stock actual',
    cellClass: (value: any, item: any) => {
      if (value === 0) return 'text-error'
      if (value > 0 && value < item.stockMinimo) return 'text-warning'
      return 'text-success'
    },
  },
  { key: 'stockMinimo', label: 'Stock mínimo' },
  { key: 'marca.nombre', label: 'Marca' },
  { key: 'categoria.nombre', label: 'Categoría' },
  { key: 'proveedor.nombreFantasia', label: 'Proveedor' },
]

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

watchEffect(() => {
  if (Number(route.query.page) !== page.value) {
    router.replace({ query: { ...route.query, page: page.value } })
  }
})

// Handlers para el DataTable
function handleSearch(searchValue: string) {
  search.value = searchValue
  page.value = 1
}

function handleLimitChange(newLimit: number) {
  limit.value = newLimit
  page.value = 1
}

function handlePageChange(newPage: number) {
  page.value = newPage
}
</script>

<template>
  <section class="md:p-4 p-1">
    <InventarioComponentDataIndexInventario />
  </section>

  <section class="md:p-4 p-1">
    <DataTable
      :data="visibleProductos"
      :columns="columns"
      :loading="pending"
      :error="!!error"
      :meta="visibleMeta"
      title="Productos"
      :search-value="search"
      :limit-value="limit"
      @search="handleSearch"
      @limit-change="handleLimitChange"
      @page-change="handlePageChange"
    >
      <!-- Acciones del header -->
      <template #header-actions>
        <button class="btn btn-dash btn-accent mr-2" @click="router.push('/compra/crear')">
          <Icon name="mdi:plus" class="mr-2" />
          Agregar inventario
        </button>
        <button class="btn btn-dash btn-primary" @click="router.push('/inventario/crear')">
          <Icon name="mdi:invoice-text-new-outline" class="mr-2" />
          Crear producto nuevo
        </button>
      </template>

      <!-- Acciones de cada fila -->
      <template #actions="{ item }">
        <button
          class="btn btn-sm btn-primary"
          @click="router.push(`/inventario/editar?id=${item.id}`)"
        >
          <Icon name="mdi:edit-outline" />
        </button>
        <button
          class="btn btn-sm btn-error"
          @click="router.push(`/inventario/eliminar?id=${item.id}`)"
        >
          <Icon name="mdi:delete-outline" />
        </button>
      </template>
    </DataTable>
  </section>
</template>
