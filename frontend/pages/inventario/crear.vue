<script setup lang="ts">
definePageMeta({
  layout: 'internal',
})

import { useApiFetch } from '#imports'
import type { Brand } from '~/types/brand'
import type { Suppliers } from '~/types/suppliers'
import type { Categories } from '~/types/categories'
import type { Subcategoria } from '~/types/subcategories'

const marcaList = ref<Brand[]>([])
const proveedorList = ref<Suppliers[]>([])
const categoriaList = ref<Categories[]>([])
const subcategoriaList = ref<Subcategoria[]>([])
const messageSuccess = ref('')
const messageError = ref('')

const producto = ref({
  sku: '',
  codigoBarras: '',
  nombre: '',
  descripcion: '',
  costoNeto: 0,
  precioVenta: 0,
  stockActual: 0,
  stockMinimo: 0,
  unidadMedida: '',
  categoriaId: 0,
  subcategoriaId: 0,
  marcaId: 0,
  proveedorId: '',
  afectoIva: true,
  activo: true,
})

const generarSku = () => {
  const nombre = producto.value.nombre?.substring(0, 3).toUpperCase() || 'XXX'
  const marca =
    marcaList.value
      .find((m) => m.id === producto.value.marcaId)
      ?.nombre?.substring(0, 3)
      .toUpperCase() || 'XXX'
  const ultimosCodigo = producto.value.codigoBarras?.slice(-4) || '0000'

  // Generar un ID único corto (4 caracteres del UUID v4)
  const idUnico = crypto.randomUUID().split('-')[0].slice(0, 6).toUpperCase()

  producto.value.sku = `${nombre}-${marca}-${ultimosCodigo}-${idUnico}`
}

onMounted(async () => {
  const [marcas, proveedores, categorias, subcategorias] = await Promise.all([
    useApiFetch('/brands'),
    useApiFetch('/suppliers'),
    useApiFetch('/categories'),
    useApiFetch('/subcategories'),
  ])

  marcaList.value = marcas
  proveedorList.value = proveedores
  categoriaList.value = categorias
  subcategoriaList.value = subcategorias
})

const subcategoriasFiltradas = computed(() => {
  return subcategoriaList.value.filter((sub) => sub.categoriaId === producto.value.categoriaId)
})

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  try {
    await useApiFetch('/products', {
      method: 'POST',
      body: producto.value,
    })

    messageSuccess.value = 'Producto creado exitosamente.'
    messageError.value = ''

    // Reiniciar el formulario
    producto.value = {
      sku: '',
      codigoBarras: '',
      nombre: '',
      descripcion: '',
      costoNeto: 0,
      precioVenta: 0,
      stockActual: 0,
      stockMinimo: 0,
      unidadMedida: '',
      categoriaId: 0,
      subcategoriaId: 0,
      marcaId: 0,
      proveedorId: '',
      afectoIva: true,
      activo: true,
    }
  } catch (error: any) {
    console.error('Error al crear producto:', error)
    messageError.value = error?.data?.message || 'Ocurrió un error al crear el producto.'
    messageSuccess.value = ''
  }
}

watch(
  () => [producto.value.codigoBarras, producto.value.nombre, producto.value.marcaId],
  () => {
    if (producto.value.codigoBarras && producto.value.nombre && producto.value.marcaId) {
      generarSku()
    }
  }
)
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 shadow-md p-6 rounded-lg">
      <h1 class="text-2xl font-semibold mb-6">Crear Producto</h1>
      <p v-if="messageSuccess" class="text-success text-lg mb-4">
        {{ messageSuccess }}
      </p>
      <p v-if="messageError" class="text-error text-lg mb-4">
        {{ messageError }}
      </p>
      <form @submit="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- SKU -->
        <label class="form-control w-full floating-label">
          <span>SKU (autogenerado)</span>
          <input v-model="producto.sku" type="text" class="input input-bordered w-full" readonly />
        </label>

        <!-- Código de barras -->
        <label class="form-control w-full floating-label">
          <span>Código de barras</span>
          <input v-model="producto.codigoBarras" type="text" class="input input-bordered w-full" />
        </label>

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

        <!-- Descripción -->
        <label class="form-control w-full floating-label">
          <span>Descripción</span>
          <input v-model="producto.descripcion" type="text" class="input input-bordered w-full" />
        </label>

        <!-- Costo neto -->
        <label class="form-control w-full floating-label">
          <span>Costo neto</span>
          <input
            v-model.number="producto.costoNeto"
            type="number"
            class="input input-bordered w-full"
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

        <!-- Stock actual -->
        <label class="form-control w-full floating-label">
          <span>Stock actual</span>
          <input
            v-model.number="producto.stockActual"
            type="number"
            class="input input-bordered w-full"
          />
        </label>

        <!-- Stock mínimo -->
        <label class="form-control w-full floating-label">
          <span>Stock de alerta</span>
          <input
            v-model.number="producto.stockMinimo"
            type="number"
            class="input input-bordered w-full"
          />
        </label>

        <!-- Unidad de medida -->
        <label class="form-control w-full floating-label">
          <span>Unidad de medida</span>
          <input v-model="producto.unidadMedida" type="text" class="input input-bordered w-full" />
        </label>

        <!-- Categoría -->
        <label class="form-control w-full floating-label">
          <span>Categoría</span>
          <select v-model="producto.categoriaId" class="select select-bordered w-full" required>
            <option disabled value="">Seleccione categoría</option>
            <option v-for="cat in categoriaList" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>
        </label>

        <!-- Subcategoría -->
        <label class="form-control w-full floating-label">
          <span>Subcategoría</span>
          <select
            v-model="producto.subcategoriaId"
            :disabled="!producto.categoriaId"
            class="select select-bordered w-full"
            required
          >
            <option disabled value="">Seleccione subcategoría</option>
            <option v-for="sub in subcategoriasFiltradas" :key="sub.id" :value="sub.id">
              {{ sub.nombre }}
            </option>
          </select>
        </label>
        <!-- Marca -->
        <label class="form-control w-full floating-label">
          <span>Marca</span>
          <select v-model="producto.marcaId" class="select select-bordered w-full" required>
            <option disabled value="">Seleccione marca</option>
            <option v-for="marca in marcaList" :key="marca.id" :value="marca.id">
              {{ marca.nombre }}
            </option>
          </select>
        </label>

        <!-- Proveedor -->
        <label class="form-control w-full floating-label">
          <span>Proveedor</span>
          <select v-model="producto.proveedorId" class="select select-bordered w-full" required>
            <option disabled value="">Seleccione proveedor</option>
            <option v-for="prov in proveedorList" :key="prov.id" :value="prov.id">
              {{ prov.nombreFantasia }}
            </option>
          </select>
        </label>

        <!-- Afecto a IVA -->
        <div class="form-control col-span-full">
          <label class="label cursor-pointer justify-start gap-4">
            <input type="checkbox" v-model="producto.afectoIva" class="checkbox" />
            <span class="label-text">¿Afecto a IVA?</span>
          </label>
        </div>

        <!-- Botón -->
        <button type="submit" class="btn btn-primary mt-4 col-span-full">Crear Producto</button>
      </form>
    </article>
  </section>
</template>
