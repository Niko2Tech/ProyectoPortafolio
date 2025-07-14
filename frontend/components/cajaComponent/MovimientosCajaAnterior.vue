<template>
  <div class="bg-base-100 shadow-md p-4 rounded-lg">
    <h2 class="text-lg font-semibold mb-4">Movimientos de la última caja</h2>
    <table v-if="movimientos.length" class="table w-full">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Monto</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="mov in movimientos" :key="mov.id">
          <td>{{ new Date(mov.fecha).toLocaleString() }}</td>
          <td>{{ mov.tipo }}</td>
          <td>${{ mov.monto.toLocaleString() }}</td>
          <td>{{ mov.detalle }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="text-gray-500 text-center py-4">No hay movimientos registrados.</div>
  </div>
</template>
<script setup lang="ts">
interface MovimientoCaja {
  id: string
  fecha: string
  tipo: string
  monto: number
  detalle: string
}
const props = defineProps<{ movimientos: MovimientoCaja[] }>()
</script>
