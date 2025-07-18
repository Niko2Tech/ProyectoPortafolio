<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApiFetch } from '#imports'

definePageMeta({
  layout: 'internal',
})
const route = useRoute()
const productoId = route.query.id as string

const producto = ref({
  nombre: '',
  costoNeto: 0,
  precioVenta: 0,
  stockMinimo: 0,
})
const messageSuccess = ref('')
const messageError = ref('')
const loading = ref(false)

onMounted(async () => {
  if (!productoId) {
    messageError.value = 'ID de producto no especificado.'
    return
  }
  loading.value = true
  try {
    const data = await useApiFetch(`/products/${productoId}`)
    producto.value = {
      nombre: data.nombre,
      costoNeto: Number(data.costoNeto),
      precioVenta: Number(data.precioVenta),
      stockMinimo: Number(data.stockMinimo),
    }
  } catch (error: any) {
    messageError.value = error?.data?.message || 'No se pudo cargar el producto.'
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  loading.value = true
  try {
    await useApiFetch(`/products/${productoId}`, {
      method: 'PATCH',
      body: {
        nombre: producto.value.nombre,
        costoNeto: producto.value.costoNeto,
        precioVenta: producto.value.precioVenta,
        stockMinimo: producto.value.stockMinimo,
      },
    })
    messageSuccess.value = 'Producto actualizado exitosamente.'
    messageError.value = ''
    setTimeout(() => {
      messageSuccess.value = ''
    }, 3000)
  } catch (error: any) {
    messageError.value = error?.data?.message || 'Ocurrió un error al actualizar el producto.'
    messageSuccess.value = ''
  } finally {
    loading.value = false
  }
}

const navigateTo = (url: string) => (window.location.href = url)
</script>
<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 shadow-md p-6 rounded-lg">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold mb-6">Editar Producto</h1>
        <button class="btn btn-sm btn-outline" @click="navigateTo('/inventario')">
          <Icon name="mdi:arrow-left" />
          Volver a inventario
        </button>
      </div>
      <p v-if="messageSuccess" class="text-success text-lg mb-4">
        {{ messageSuccess }}
      </p>
      <p v-if="messageError" class="text-error text-lg mb-4">
        {{ messageError }}
      </p>
      <form @submit="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="!loading">
        <!-- Nombre -->
        <label class="form-control w-full floating-label">
          <span>Nombre del producto</span>
          <input
            v-model="producto.nombre"
            type="text"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Costo neto -->
        <label class="form-control w-full floating-label">
          <span>Costo neto</span>
          <input
            v-model.number="producto.costoNeto"
            type="number"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Precio venta -->
        <label class="form-control w-full floating-label">
          <span>Precio venta</span>
          <input
            v-model.number="producto.precioVenta"
            type="number"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Stock de alerta -->
        <label class="form-control w-full floating-label">
          <span>Stock de alerta</span>
          <input
            v-model.number="producto.stockMinimo"
            type="number"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Botón -->
        <button type="submit" class="btn btn-primary mt-4 col-span-full" :disabled="!productoId">
          Actualizar Producto
        </button>
      </form>
      <div v-else class="text-center py-8">Cargando...</div>
    </article>
  </section>
</template>
