<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useApiComponent } from '@/composables/useApiComponent'
import type { PaginatedResponse, PaginationMeta } from '~/types/api'
import type { Suppliers } from '~/types/suppliers'

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
} = useApiComponent<PaginatedResponse<Suppliers>>('/suppliers', {
  query: {
    page,
    limit,
    search,
  },
  key: computed(() => `proveedores-page-${page.value}-limit-${limit.value}-search-${search.value}`),
})

const visibleSuppliers = ref<Suppliers[]>([])
const visibleMeta = ref<PaginationMeta>({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: limit.value,
  totalPages: 1,
  currentPage: page.value,
})

// Configuración de columnas para la tabla
const columns = [
  { key: 'razonSocial', label: 'Razón Social' },
  { key: 'nombreFantasia', label: 'Nombre Fantasía' },
  { key: 'rut', label: 'RUT' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'email', label: 'Email' },
  { key: 'direccionCompleta', label: 'Dirección' }, // clave personalizada
  { key: 'giro', label: 'Giro' },
]

watch(
  () => response.value,
  (newData) => {
    if (newData) {
      visibleSuppliers.value = newData.data
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
      :data="visibleSuppliers"
      :columns="columns"
      :loading="pending"
      :error="!!error"
      :meta="visibleMeta"
      title="Proveedores"
      :search-value="search"
      :limit-value="limit"
      @search="handleSearch"
      @limit-change="handleLimitChange"
      @page-change="handlePageChange"
    >
      <!-- Acciones del header -->
      <template #header-actions>
        <button class="btn btn-dash btn-primary" @click="router.push('/proveedor/crear')">
          <Icon name="mdi:plus" class="mr-2" />
          Crear proveedor
        </button>
      </template>

      <template #cell-direccionCompleta="{ item }">
        {{ item.direccion }}, {{ item.comuna?.nombre }}, {{ item.comuna?.region?.nombre }}
      </template>

      <!-- Acciones de cada fila -->
      <template #actions="{ item }">
        <button class="btn btn-sm btn-info" @click="router.push(`/proveedores/ver?id=${item.id}`)">
          <Icon name="mdi:eye-outline" />
        </button>
        <button
          class="btn btn-sm btn-primary"
          @click="router.push(`/proveedores/editar?id=${item.id}`)"
        >
          <Icon name="mdi:edit-outline" />
        </button>
        <button
          class="btn btn-sm btn-error"
          @click="router.push(`/proveedores/eliminar?id=${item.id}`)"
        >
          <Icon name="mdi:delete-outline" />
        </button>
      </template>
    </DataTable>
  </section>
</template>
