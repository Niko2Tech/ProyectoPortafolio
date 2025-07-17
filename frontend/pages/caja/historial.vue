<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useApiComponent } from '@/composables/useApiComponent'
import type { PaginatedResponse, PaginationMeta } from '~/types/api'
import type { CajaResponse, Caja } from '~/types/historialCaja'
import { formatChileanCurrency } from '#imports'
import { useUserStore } from '@/stores/user'
import VentasCajaModal from '@/components/cajaComponent/VentasCajaModal.vue'

definePageMeta({
  layout: 'internal',
})

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const usuarioId = user.id

// Estado para el modal de ventas
const showVentasModal = ref(false)
const movimientosCajaSeleccionada = ref<any[]>([])
const cajaSeleccionadaId = ref<string | null>(null)

const page = ref(Number(route.query.page) || 1)
const limit = ref(10)
const search = ref(
  Array.isArray(route.query.search) ? route.query.search[0] || '' : route.query.search || ''
)

const {
  data: response,
  pending,
  error,
} = useApiComponent<CajaResponse>('/caja/ultimas-cajas-usuario', {
  query: {
    usuarioId,
    page,
    limit,
    search,
  },
  key: computed(() => `cajas-page-${page.value}-limit-${limit.value}-search-${search.value}`),
})

const visibleCajas = ref<Caja[]>([])
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
    key: 'usuario.nombre',
    label: 'Usuario',
    formatter: (value: any, item: any) => `${item.usuario.nombre} ${item.usuario.apellido}`,
  },
  {
    key: 'fechaApertura',
    label: 'Fecha Apertura',
    formatter: (value: string) => new Date(value).toLocaleDateString('es-CL'),
  },
  {
    key: 'montoApertura',
    label: 'Monto Apertura',
    formatter: (value: string) => formatChileanCurrency(Number(value)),
  },
  {
    key: 'fechaCierre',
    label: 'Fecha Cierre',
    formatter: (value: string) => (value ? new Date(value).toLocaleDateString('es-CL') : '-'),
  },
  {
    key: 'montoCierre',
    label: 'Monto Cierre',
    formatter: (value: string) => (value ? formatChileanCurrency(Number(value)) : '-'),
  },
  {
    key: 'estado',
    label: 'Estado',
    cellClass: (value: string) => {
      if (value === 'ABIERTA') return 'text-success font-semibold'
      if (value === 'CERRADA') return 'text-error font-semibold'
      return 'text-warning font-semibold'
    },
  },
  {
    key: 'movimientos',
    label: 'Movimientos',
    formatter: (value: any[]) => (value?.length || 0).toString(),
  },
]

watch(
  () => response.value,
  (newData) => {
    if (newData) {
      visibleCajas.value = newData.data
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

function handleViewSales(caja: Caja) {
  cajaSeleccionadaId.value = caja.id
  movimientosCajaSeleccionada.value = Array.isArray(caja.movimientos) ? caja.movimientos : []
  showVentasModal.value = true
}
</script>

<template>
  <section class="md:p-4 p-1">
    <DataTable
      :data="visibleCajas"
      :columns="columns"
      :loading="pending"
      :error="!!error"
      :meta="visibleMeta"
      title="Historial de Cajas"
      :search-value="search"
      :limit-value="limit"
      @search="handleSearch"
      @limit-change="handleLimitChange"
      @page-change="handlePageChange"
    >
      <!-- Acciones del header -->
      <template #header-actions>
        <button class="btn btn-dash btn-primary" @click="router.push('/caja')">
          <Icon name="mdi:cash-register" class="mr-2" />
          Ir a Caja
        </button>
      </template>

      <!-- Acciones de cada fila -->
      <template #actions="{ item }">
        <button
          class="btn btn-sm btn-info"
          @click="handleViewSales(item)"
          title="Ver movimientos de esta caja"
        >
          <Icon name="mdi:receipt-text" />
        </button>
      </template>
    </DataTable>
  </section>

  <!-- Modal de movimientos -->
  <Modal :title="'Movimientos de la caja'" v-model:visible="showVentasModal">
    <VentasCajaModal :movimientos="movimientosCajaSeleccionada" />
  </Modal>
</template>
