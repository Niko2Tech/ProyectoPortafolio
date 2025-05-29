<script setup lang="ts">
definePageMeta({
  layout: 'internal',
})
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
    <!-- Ventas -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Ventas</p>
      <p class="text-2xl font-bold">$ 832</p>
    </article>

    <!-- Ingresos -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Ingresos</p>
      <p class="text-2xl font-bold">$ 18,300</p>
    </article>

    <!-- Ganancias -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Ganancias</p>
      <p class="text-2xl font-bold">$ 868</p>
    </article>

    <!-- Costos -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Costos</p>
      <p class="text-2xl font-bold">$ 17,432</p>
    </article>

    <!-- Compras -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Compras</p>
      <p class="text-2xl font-bold">82</p>
    </article>

    <!-- Total devuelto -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Total devuelto</p>
      <p class="text-2xl font-bold">$ 17,432</p>
    </article>

    <!-- Canceladas -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Ordenes canceladas</p>
      <p class="text-2xl font-bold">5</p>
    </article>

    <!-- Total vendido -->
    <article class="card bg-base-100 shadow p-4">
      <p class="text-sm text-gray-500">Productos vendidos</p>
      <p class="text-2xl font-bold">$ 13,573</p>
    </article>
  </section>
</template>
