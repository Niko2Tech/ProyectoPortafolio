<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'vue-chartjs'
import { ref, computed, onMounted } from 'vue'
import type { DashboardResponse } from '~/types/dashboard'
import { useApiFetch } from '~/composables/useApiFetch'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
)

definePageMeta({ layout: 'internal' })

// Fallback en caso de error
const fallbackData: DashboardResponse = {
  cards: {
    productosStockBajo: {
      sinStock: 0,
      stockBajo: 2,
      productos: [
        { id: '0001', nombre: 'Producto A', stockActual: 2, stockMinimo: 5 },
        { id: '0002', nombre: 'Producto B', stockActual: 1, stockMinimo: 10 },
      ],
    },
    ventasHoy: { cantidad: 5, monto: 125000 },
    comprasDelMes: { cantidad: 8, monto: 450000 },
  },
  graficos: {
    ventasPorDia: [
      { fecha: '2025-07-15', ventas: 50000, cantidad: 3 },
      { fecha: '2025-07-16', ventas: 75000, cantidad: 5 },
      { fecha: '2025-07-17', ventas: 100000, cantidad: 7 },
    ],
    topProductos: [
      { producto: 'Ejemplo 1', cantidad: 10, monto: 100000 },
      { producto: 'Ejemplo 2', cantidad: 8, monto: 75000 },
      { producto: 'Ejemplo 3', cantidad: 6, monto: 50000 },
    ],
    metodosPageMasUsados: [
      { metodo: 'Efectivo', cantidad: 7, monto: 150000 },
      { metodo: 'Tarjeta', cantidad: 5, monto: 100000 },
    ],
    comprasPorMes: [{ mes: '2025-07', cantidad: 8, monto: 450000 }],
    movimientosInventario: [
      { fecha: '2025-07-15', entradas: 10, salidas: 2 },
      { fecha: '2025-07-16', entradas: 5, salidas: 4 },
    ],
  },
}

// Estados
const dashboardData = ref<DashboardResponse | null>(null)
const isInitialized = ref(false)
const hasError = ref(false)

// Llamar a la API en el cliente
onMounted(async () => {
  try {
    dashboardData.value = await useApiFetch<DashboardResponse>('/dashboard/informacion-general')
  } catch (err) {
    console.error('Error al cargar datos del dashboard:', err)
    dashboardData.value = fallbackData
    hasError.value = true
  } finally {
    isInitialized.value = true
  }
})

// Formatear moneda
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value)

// Computeds para los gráficos
const ventasChartData = computed(() => ({
  labels: dashboardData.value?.graficos.ventasPorDia.map((item) =>
    new Date(item.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })
  ),
  datasets: [
    {
      label: 'Ventas ($)',
      data: dashboardData.value?.graficos.ventasPorDia.map((item) => item.ventas) ?? [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
  ],
}))

const topProductosChartData = computed(() => ({
  labels: dashboardData.value?.graficos.topProductos.map((item) =>
    item.producto.length > 15 ? item.producto.slice(0, 15) + '...' : item.producto
  ),
  datasets: [
    {
      label: 'Cantidad vendida',
      data: dashboardData.value?.graficos.topProductos.map((item) => item.cantidad) ?? [],
      backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'].map(
        (color) => `${color}cc`
      ),
      borderColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'],
      borderWidth: 1,
    },
  ],
}))

const metodosPagoChartData = computed(() => ({
  labels: dashboardData.value?.graficos.metodosPageMasUsados.map((item) => item.metodo) ?? [],
  datasets: [
    {
      data: dashboardData.value?.graficos.metodosPageMasUsados.map((item) => item.monto) ?? [],
      backgroundColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b'].map((color) => `${color}cc`),
      borderColor: ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b'],
      borderWidth: 2,
    },
  ],
}))

const movimientosChartData = computed(() => ({
  labels: dashboardData.value?.graficos.movimientosInventario.map((item) =>
    new Date(item.fecha).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })
  ),
  datasets: [
    {
      label: 'Entradas',
      data: dashboardData.value?.graficos.movimientosInventario.map((item) => item.entradas) ?? [],
      backgroundColor: '#22c55ecc',
      borderColor: '#22c55e',
      borderWidth: 1,
    },
    {
      label: 'Salidas',
      data: dashboardData.value?.graficos.movimientosInventario.map((item) => item.salidas) ?? [],
      backgroundColor: '#ef4444cc',
      borderColor: '#ef4444',
      borderWidth: 1,
    },
  ],
}))

// Opciones de gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    y: { beginAtZero: true },
  },
}

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const },
  },
}
</script>

<template>
  <div v-if="!isInitialized" class="flex justify-center items-center min-h-[300px]">
    <div class="text-center">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4 text-gray-500">Cargando dashboard...</p>
    </div>
  </div>
  <div v-else>
    <div class="p-4 space-y-6">
      <!-- Cards de resumen -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <!-- Ventas de hoy -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm opacity-70">Ventas de hoy</h3>
            <p class="text-2xl font-bold">{{ dashboardData!.cards.ventasHoy.cantidad }}</p>
            <p class="text-sm opacity-60">
              {{ formatCurrency(dashboardData!.cards.ventasHoy.monto) }}
            </p>
          </div>
        </article>

        <!-- Compras del mes -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm opacity-70">Compras del mes</h3>
            <p class="text-2xl font-bold">{{ dashboardData!.cards.comprasDelMes.cantidad }}</p>
            <p class="text-sm opacity-60">
              {{ formatCurrency(dashboardData!.cards.comprasDelMes.monto) }}
            </p>
          </div>
        </article>

        <!-- Productos sin stock -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm opacity-70">Sin stock</h3>
            <p class="text-2xl font-bold text-error">
              {{ dashboardData!.cards.productosStockBajo.sinStock }}
            </p>
            <p class="text-sm opacity-60">productos</p>
          </div>
        </article>

        <!-- Productos con stock bajo -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h3 class="card-title text-sm opacity-70">Stock bajo</h3>
            <p class="text-2xl font-bold text-warning">
              {{ dashboardData!.cards.productosStockBajo.stockBajo }}
            </p>
            <p class="text-sm opacity-60">productos</p>
          </div>
        </article>
      </section>

      <!-- Productos con stock bajo -->
      <section class="card bg-base-100 shadow max-h-96 overflow-y-auto">
        <div class="card-body">
          <h2 class="card-title text-warning flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Productos con stock bajo
          </h2>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock actual</th>
                  <th>Stock mínimo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="producto in dashboardData!.cards.productosStockBajo.productos"
                  :key="producto.id"
                >
                  <td>{{ producto.nombre }}</td>
                  <td>{{ producto.stockActual }}</td>
                  <td>{{ producto.stockMinimo }}</td>
                  <td>
                    <span v-if="producto.stockActual === 0" class="badge badge-error">
                      Sin stock
                    </span>
                    <span
                      v-else-if="
                        producto.stockActual > 0 && producto.stockActual <= producto.stockMinimo
                      "
                      class="badge badge-warning"
                    >
                      Stock bajo
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Gráficos -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gráfico de ventas por día -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Ventas por día</h2>
            <div class="h-64">
              <Line :data="ventasChartData" :options="chartOptions" />
            </div>
          </div>
        </article>

        <!-- Gráfico de top productos -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Top productos vendidos</h2>
            <div class="h-64">
              <Bar :data="topProductosChartData" :options="chartOptions" />
            </div>
          </div>
        </article>

        <!-- Gráfico de métodos de pago -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Métodos de pago</h2>
            <div class="h-64">
              <Pie :data="metodosPagoChartData" :options="pieOptions" />
            </div>
          </div>
        </article>

        <!-- Gráfico de movimientos de inventario -->
        <article class="card bg-base-100 shadow">
          <div class="card-body">
            <h2 class="card-title">Movimientos de inventario</h2>
            <div class="h-64">
              <Bar :data="movimientosChartData" :options="chartOptions" />
            </div>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>
