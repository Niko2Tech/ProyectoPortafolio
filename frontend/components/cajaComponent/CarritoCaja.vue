<template>
  <div class="flex flex-col h-[600px] bg-base-100 p-4 rounded-lg gap-4">
    <h2 class="text-lg font-semibold mb-4">Carrito</h2>
    <div class="rounded-lg h-full max-h-[500px] overflow-y-auto">
      <table v-if="carrito.length" class="table w-full">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in carrito" :key="item.id">
            <td>
              <div class="flex items-center gap-2">
                {{ item.nombre }}
                <div v-if="item.cantidad > item.stockActual" class="text-error text-sm">
                  Stock insuficiente máximo {{ item.stockActual }}
                </div>
              </div>
            </td>
            <td>${{ Number(item.precioVenta).toLocaleString() }}</td>
            <td>
              <input
                type="number"
                min="1"
                :max="item.stockActual"
                class="input input-bordered w-20"
                :class="{ 'input-error': item.cantidad > item.stockActual }"
                v-model.number="item.cantidad"
                @change="onCantidadChange(item)"
              />
            </td>
            <td>${{ (Number(item.precioVenta) * item.cantidad).toLocaleString() }}</td>
            <td>
              <button
                class="btn btn-sm btn-error font-normal"
                @click="emit('eliminar-carrito', item)"
              >
                <Icon name="mdi:trash-can" />
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-gray-500 text-center py-4 h-full flex items-center justify-center">
        No hay productos en el carrito.
      </div>
    </div>
    <!-- Total y botón pagar -->
    <div class="flex justify-between items-center mt-4 gap-4">
      <div class="flex gap-2 items-center">
        <button class="btn btn-sm btn-error font-normal" @click="emit('vaciar-carrito')">
          <Icon name="mdi:trash-can" />
          Vaciar carrito
        </button>
      </div>
      <div class="flex gap-2 items-center">
        <div class="text-lg font-bold">Total: ${{ totalCarrito.toLocaleString() }}</div>
        <button class="btn btn-success" :disabled="!carrito.length || hayStockInsuficiente">
          <Icon name="mdi:cash-multiple" />
          Pagar
        </button>
      </div>
    </div>
    <slot />
  </div>
</template>
<script setup lang="ts">
import type { Producto } from '~/types/product'
import { computed } from 'vue'
interface CarritoItem extends Producto {
  cantidad: number
}
const props = defineProps<{ carrito: CarritoItem[] }>()
const emit = defineEmits(['update-cantidad', 'vaciar-carrito', 'eliminar-carrito'])
function onCantidadChange(item: CarritoItem) {
  emit('update-cantidad', item)
}
const totalCarrito = computed(() =>
  props.carrito.reduce((acc, item) => acc + Number(item.precioVenta) * item.cantidad, 0)
)
const hayStockInsuficiente = computed(() =>
  props.carrito.some((item) => item.cantidad > item.stockActual)
)
</script>
