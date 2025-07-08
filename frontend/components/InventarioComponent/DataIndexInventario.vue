<script setup lang="ts">
import { formatChileanCurrency } from '#imports'
const numCategorias = ref(0)
const totalProductos = ref(0)
const totalValorProductos = ref(0)
const ultimasVentas = ref(0)
const costoVentas = ref(0)
const productosBajoStock = ref(0)
const productosSinStock = ref(0)

const { data } = await useApiComponent('/products/resumen')
numCategorias.value = data.value?.numCategorias || 0
totalProductos.value = data.value?.totalProductos || 0
totalValorProductos.value = data.value?.totalValorProductos || 0
ultimasVentas.value = data.value?.ultimasVentas || 0
costoVentas.value = data.value?.costoVentas || 0
productosBajoStock.value = data.value?.productosBajoStock || 0
productosSinStock.value = data.value?.productosSinStock || 0
</script>
<template>
  <h2 class="text-2xl font-semibold mb-6">Revisión de Inventario</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Categorías (sin cambios) -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="text-lg text-primary font-semibold mb-4">Categorías</h3>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-2xl font-bold">{{ numCategorias }}</p>
            <p class="text-sm text-gray-500">Total de categorias</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Total Productos (ya actualizado por ti) -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="text-lg text-warning font-semibold mb-4">Total Productos</h3>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-2xl font-bold">{{ totalProductos }}</p>
            <p class="text-sm text-gray-500">Total de productos</p>
          </div>
          <div>
            <p class="text-xl font-bold">
              {{ formatChileanCurrency(totalValorProductos) }}
            </p>
            <p class="text-sm text-gray-500">Valor total productos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Ventas recientes -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="text-lg text-purple-600 font-semibold mb-4">Ventas Recientes</h3>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-2xl font-bold">{{ ultimasVentas }}</p>
            <p class="text-sm text-gray-500">Últimos 7 días</p>
          </div>
          <div>
            <p class="text-xl font-bold">
              {{ formatChileanCurrency(costoVentas) }}
            </p>
            <p class="text-sm text-gray-500">Costo total</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock bajo -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h3 class="text-lg text-error font-semibold mb-4">Stock Bajo</h3>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-2xl font-bold">{{ productosBajoStock }}</p>
            <p class="text-sm text-gray-500">Productos bajo stock</p>
          </div>
          <div>
            <p class="text-xl font-bold">
              {{ productosSinStock }}
            </p>
            <p class="text-sm text-gray-500">Sin stock</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
