<template>
  <div
    class="bg-base-100 shadow-md p-4 rounded-lg transition-opacity duration-300"
    :class="{ 'opacity-50 pointer-events-none': loading }"
  >
    <!-- Header -->
    <div class="flex flex-row justify-between items-center mb-4" v-if="showHeader">
      <h1 class="text-2xl font-bold">{{ title }}</h1>
      <div class="flex gap-2">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Controles de tabla -->
    <div class="flex flex-row justify-between items-center mb-4">
      <div v-if="showLimitSelector">
        <select class="select" v-model.number="internalLimit" @change="onLimitChange">
          <option v-for="option in limitOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
      <div v-if="showSearch">
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
          <input
            type="search"
            class="grow"
            :placeholder="searchPlaceholder"
            v-model="internalSearch"
            @input="onSearchChange"
          />
        </label>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="table w-full text-sm">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :class="column.headerClass">
              {{ column.label }}
            </th>
            <th v-if="showActions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="data.length">
            <tr
              v-for="(item, index) in data"
              :key="getItemKey(item, index)"
              class="hover:bg-gray-100 transition-colors duration-150"
            >
              <td v-for="column in columns" :key="column.key" :class="getCellClass(column, item)">
                <slot
                  :name="`cell-${column.key}`"
                  :item="item"
                  :value="getNestedValue(item, column.key)"
                  :column="column"
                >
                  {{ formatCellValue(item, column) }}
                </slot>
              </td>
              <td v-if="showActions" class="flex gap-1">
                <slot name="actions" :item="item" :index="index" />
              </td>
            </tr>
          </template>
          <tr v-if="!data.length && !loading">
            <td :colspan="totalColumns" class="text-center text-gray-500 py-4">
              {{ emptyMessage }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div
      class="flex flex-row justify-between items-center mt-4 gap-1"
      v-if="showPagination && meta.totalItems > 0"
    >
      <p class="text-sm text-gray-500 mb-2">
        Mostrando {{ startItem }} a {{ endItem }} de {{ meta.totalItems }}
      </p>
      <div class="flex flex-row justify-center items-center mt-4 gap-1">
        <button @click="previousPage" :disabled="meta.currentPage === 1" class="btn btn-sm">
          <Icon name="mdi:chevron-left" />
        </button>
        <div v-for="item in paginationRange" :key="item">
          <button
            v-if="typeof item === 'number'"
            @click="goToPage(item)"
            class="btn btn-sm"
            :class="{ 'btn-primary': item === meta.currentPage }"
          >
            {{ item }}
          </button>
          <span v-else class="mx-1 text-sm">...</span>
        </div>
        <button
          @click="nextPage"
          :disabled="meta.currentPage === meta.totalPages"
          class="btn btn-sm"
        >
          <Icon name="mdi:chevron-right" />
        </button>
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div v-if="error" class="bg-base-100 shadow-md p-4 rounded-lg mt-4">
    <div role="alert" class="alert alert-error">
      <Icon name="mdi:alert" class="text-lg" />
      <span class="text-lg">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  formatter?: (value: any, item: any) => string
  cellClass?: string | ((value: any, item: any) => string)
  headerClass?: string
  sortable?: boolean
}

interface PaginationMeta {
  totalItems: number
  itemCount: number
  itemsPerPage: number
  totalPages: number
  currentPage: number
}

interface Props {
  // Datos
  data: any[]
  columns: Column[]
  loading?: boolean
  error?: boolean

  // Metadatos de paginación
  meta?: PaginationMeta

  // Configuración de UI
  title?: string
  showHeader?: boolean
  showSearch?: boolean
  showLimitSelector?: boolean
  showPagination?: boolean
  showActions?: boolean

  // Configuración de búsqueda
  searchPlaceholder?: string
  searchValue?: string
  searchDebounce?: number

  // Configuración de límites
  limitOptions?: number[]
  limitValue?: number

  // Mensajes
  emptyMessage?: string
  errorMessage?: string

  // Configuración adicional
  itemKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: false,
  meta: () => ({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  }),
  title: 'Tabla',
  showHeader: true,
  showSearch: true,
  showLimitSelector: true,
  showPagination: true,
  showActions: true,
  searchPlaceholder: 'Buscar...',
  searchValue: '',
  searchDebounce: 400,
  limitOptions: () => [10, 20, 50, 100],
  limitValue: 10,
  emptyMessage: 'No se encontraron datos.',
  errorMessage: 'Error al cargar los datos. Por favor, contactar a soporte.',
  itemKey: 'id',
})

const emit = defineEmits<{
  'update:search': [value: string]
  'update:limit': [value: number]
  'update:page': [value: number]
  search: [value: string]
  'limit-change': [value: number]
  'page-change': [value: number]
}>()

// Estado interno
const internalSearch = ref(props.searchValue)
const internalLimit = ref(props.limitValue)
let debounceTimer: NodeJS.Timeout

// Watchers para sincronizar props
watch(
  () => props.searchValue,
  (val) => {
    internalSearch.value = val
  }
)

watch(
  () => props.limitValue,
  (val) => {
    internalLimit.value = val
  }
)

// Computed properties
const totalColumns = computed(() => {
  return props.columns.length + (props.showActions ? 1 : 0)
})

const startItem = computed(() => {
  return (props.meta.currentPage - 1) * props.meta.itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.meta.currentPage * props.meta.itemsPerPage, props.meta.totalItems)
})

const paginationRange = computed(() => {
  const current = props.meta.currentPage
  const total = props.meta.totalPages
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

// Métodos
function getItemKey(item: any, index: number): string | number {
  return item[props.itemKey] || index
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function formatCellValue(item: any, column: Column): string {
  const value = getNestedValue(item, column.key)

  if (column.formatter) {
    return column.formatter(value, item)
  }

  return value?.toString() || ''
}

function getCellClass(column: Column, item: any): string {
  if (!column.cellClass) return ''

  if (typeof column.cellClass === 'string') {
    return column.cellClass
  }

  const value = getNestedValue(item, column.key)
  return column.cellClass(value, item)
}

function onSearchChange(): void {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:search', internalSearch.value)
    emit('search', internalSearch.value)
  }, props.searchDebounce)
}

function onLimitChange(): void {
  emit('update:limit', internalLimit.value)
  emit('limit-change', internalLimit.value)
}

function goToPage(page: number): void {
  emit('update:page', page)
  emit('page-change', page)
}

function previousPage(): void {
  if (props.meta.currentPage > 1) {
    goToPage(props.meta.currentPage - 1)
  }
}

function nextPage(): void {
  if (props.meta.currentPage < props.meta.totalPages) {
    goToPage(props.meta.currentPage + 1)
  }
}

// Cleanup
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

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
