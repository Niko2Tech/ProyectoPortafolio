<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useApiComponent } from '@/composables/useApiComponent'
import type { PaginationMeta } from '~/types/api'
import type { MovimientoInventarioResponse, MovimientoInventario } from '~/types/historialproduct'
import { formatChileanCurrency } from '#imports'
import { useUserStore } from '@/stores/user'

definePageMeta({
  layout: 'internal',
})

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const usuarioId = user.id

const page = ref(Number(route.query.page) || 1)
const limit = ref(10)
const search = ref(
  Array.isArray(route.query.search) ? route.query.search[0] || '' : route.query.search || ''
)

const {
  data: response,
  pending,
  error,
} = useApiComponent<MovimientoInventarioResponse>('/inventory', {
  query: {
    page,
    limit,
    search,
  },
  key: computed(() => `movimientos-page-${page.value}-limit-${limit.value}-search-${search.value}`),
})

const visibleMovimientos = ref<MovimientoInventario[]>([])
const visibleMeta = ref<PaginationMeta>({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: limit.value,
  totalPages: 1,
  currentPage: page.value,
})

// Configuración de columnas para la tabla
const columns = [
  {
    key: 'producto.nombre',
    label: 'Producto',
    formatter: (value: any, item: any) => item.producto?.nombre || '-',
  },
  {
    key: 'producto.sku',
    label: 'SKU',
    formatter: (value: any, item: any) => item.producto?.sku || '-',
  },
  {
    key: 'tipoMovimiento',
    label: 'Tipo',
    cellClass: (value: string) => {
      if (value === 'entrada') return 'text-success font-semibold'
      if (value === 'salida') return 'text-error font-semibold'
      return 'text-warning font-semibold'
    },
    formatter: (value: string) => (value === 'entrada' ? 'Entrada' : 'Salida'),
  },
  {
    key: 'cantidad',
    label: 'Cantidad',
    formatter: (value: number) => value.toString(),
  },
  {
    key: 'stockAnterior',
    label: 'Stock Anterior',
    formatter: (value: number) => value.toString(),
  },
  {
    key: 'stockNuevo',
    label: 'Stock Nuevo',
    formatter: (value: number) => value.toString(),
  },
  {
    key: 'usuario.nombre',
    label: 'Usuario',
    formatter: (value: any, item: any) =>
      `${item.usuario?.nombre || ''} ${item.usuario?.apellido || ''}`.trim() || '-',
  },
  {
    key: 'fecha',
    label: 'Fecha',
    formatter: (value: string) => new Date(value).toLocaleDateString('es-CL'),
  },
  {
    key: 'comentario',
    label: 'Comentario',
    formatter: (value: string) => value || '-',
  },
]

watch(
  () => response.value,
  (newData) => {
    if (newData) {
      visibleMovimientos.value = newData.data
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
    <DataTable
      :data="visibleMovimientos"
      :columns="columns"
      :loading="pending"
      :error="!!error"
      :meta="visibleMeta"
      title="Movimientos de Inventario"
      :search-value="search"
      :limit-value="limit"
      @search="handleSearch"
      @limit-change="handleLimitChange"
      @page-change="handlePageChange"
    >
      <!-- Acciones del header -->
      <template #header-actions>
        <button class="btn btn-dash btn-primary" @click="router.push('/inventario')">
          <Icon name="mdi:package-variant" class="mr-2" />
          Ir a Inventario
        </button>
      </template>
    </DataTable>
  </section>
</template>
