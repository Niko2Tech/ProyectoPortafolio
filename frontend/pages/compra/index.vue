<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useApiComponent } from '@/composables/useApiComponent'
import type { PaginatedResponse, PaginationMeta } from '~/types/api'
import { formatChileanCurrency } from '#imports'
import type { TipoDocumentoCompra, EstadoCompra, Compra } from '~/types/purchases'

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
} = useApiComponent<PaginatedResponse<Compra>>('/purchases', {
  query: {
    page,
    limit,
    search,
  },
  key: computed(() => `compras-page-${page.value}-limit-${limit.value}-search-${search.value}`),
})

const visibleCompras = ref<Compra[]>([])
const visibleMeta = ref<PaginationMeta>({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: limit.value,
  totalPages: 1,
  currentPage: page.value,
})

// Función para formatear fecha
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-CL')
}

// Función para obtener el texto del tipo de documento
function getTipoDocumentoText(tipo: TipoDocumentoCompra) {
  const tipos = {
    factura: 'Factura',
    boleta: 'Boleta',
    otro: 'Otro',
  }
  return tipos[tipo]
}

// Función para obtener el texto del estado
function getEstadoText(estado: EstadoCompra) {
  const estados = {
    pendiente: 'Pendiente',
    recibida: 'Recibida',
    pagada: 'Pagada',
    anulada: 'Anulada',
  }
  return estados[estado]
}

// Configuración de columnas para la tabla
const columns = [
  {
    key: 'tipoDocumento',
    label: 'Tipo',
    formatter: (value: TipoDocumentoCompra) => getTipoDocumentoText(value),
  },
  { key: 'numeroDocumento', label: 'N° Documento' },
  { key: 'proveedor.nombreFantasia', label: 'Proveedor' },
  {
    key: 'fechaEmision',
    label: 'Fecha Emisión',
    formatter: (value: string) => formatDate(value),
  },
  {
    key: 'fechaRecepcion',
    label: 'Fecha Recepción',
    formatter: (value: string) => formatDate(value),
  },
  {
    key: 'total',
    label: 'Total',
    formatter: (value: any) => formatChileanCurrency(Number(value)),
  },
  {
    key: 'estado',
    label: 'Estado',
    formatter: (value: EstadoCompra) => getEstadoText(value),
    cellClass: (value: EstadoCompra) => {
      const classes = {
        pendiente: 'text-warning',
        recibida: 'text-info',
        pagada: 'text-success',
        anulada: 'text-error',
      }
      return classes[value]
    },
  },
  { key: 'usuario.nombre', label: 'Usuario' },
]

watch(
  () => response.value,
  (newData) => {
    if (newData) {
      visibleCompras.value = newData.data
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
      :data="visibleCompras"
      :columns="columns"
      :loading="pending"
      :error="!!error"
      :meta="visibleMeta"
      title="Compras"
      :search-value="search"
      :limit-value="limit"
      @search="handleSearch"
      @limit-change="handleLimitChange"
      @page-change="handlePageChange"
    >
      <!-- Acciones del header -->
      <template #header-actions>
        <button class="btn btn-dash btn-primary" @click="router.push('/compra/crear')">
          <Icon name="mdi:plus" class="mr-2" />
          Nueva compra
        </button>
      </template>

      <!-- Acciones de cada fila -->
      <template #actions="{ item }">
        <div
          class="flex items-center gap-2"
          v-if="item.estado !== 'recibida' && item.estado !== 'anulada'"
        >
          <button
            class="btn btn-sm btn-primary mr-2"
            @click="router.push(`/compra/editar?id=${item.id}`)"
          >
            <Icon name="mdi:edit-outline" />
            Editar
          </button>
          <button
            class="btn btn-sm btn-secondary"
            @click="router.push(`/compra/cambiarEstado?id=${item.id}`)"
          >
            <Icon name="mdi:swap-horizontal" />
            Cambiar estado
          </button>
        </div>
        <div class="flex items-center gap-2" v-else>
          <p class="text-sm text-gray-500">Item sin acciones</p>
        </div>
      </template>
    </DataTable>
  </section>
</template>
