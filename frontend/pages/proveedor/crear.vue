<script setup lang="ts">
definePageMeta({
  layout: 'internal',
})

import { useApiFetch } from '#imports'
import { ref, onMounted, computed } from 'vue'
import { RutValidator } from '#imports' // Ajusta la ruta según tu estructura

// Tipos para comuna y región
interface Region {
  id: number
  nombre: string
  codigo: string
}

interface Comuna {
  id: number
  nombre: string
  regionId: number
  region: Region
}

const messageSuccess = ref('')
const messageError = ref('')
const comunasList = ref<Comuna[]>([])
const regionId = ref<number | ''>('')
const rutError = ref('')

const proveedor = ref({
  razonSocial: '',
  nombreFantasia: '',
  rut: '',
  telefono: '',
  email: '',
  direccion: '',
  giro: '',
  comunaId: '',
})

onMounted(async () => {
  try {
    const comunas = await useApiFetch<Comuna[]>('/communes')
    comunasList.value = comunas
  } catch (error: any) {
    messageError.value = 'Error al cargar comunas.'
  }
})

const regionesList = computed<Region[]>(() => {
  // Extrae regiones únicas de las comunas
  const regionesMap: Record<number, Region> = {}
  comunasList.value.forEach((comuna) => {
    if (comuna.region) {
      regionesMap[comuna.region.id] = comuna.region
    }
  })
  return Object.values(regionesMap)
})

const comunasFiltradas = computed(() => {
  if (!regionId.value) return []
  return comunasList.value.filter((c) => c.regionId === regionId.value)
})

// Manejo del RUT
const handleRutInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const formatted = RutValidator.formatRut(target.value)
  proveedor.value.rut = formatted

  // Valida el RUT si tiene contenido
  if (formatted.length > 0) {
    const validation = RutValidator.validateRut(formatted)
    rutError.value = validation.message || ''
  } else {
    rutError.value = ''
  }
}

// Validación del RUT al salir del campo
const handleRutBlur = () => {
  if (proveedor.value.rut) {
    const validation = RutValidator.validateRut(proveedor.value.rut)
    rutError.value = validation.message || ''
  }
}

// Validación del formulario
const isFormValid = computed(() => {
  const validation = RutValidator.validateRut(proveedor.value.rut)
  return validation.isValid && !rutError.value
})

const handleSubmit = async (event: Event) => {
  event.preventDefault()

  // Validación final del RUT
  const rutValidation = RutValidator.validateRut(proveedor.value.rut)
  if (!rutValidation.isValid) {
    rutError.value = rutValidation.message || 'RUT inválido'
    return
  }

  try {
    await useApiFetch('/suppliers', {
      method: 'POST',
      body: {
        ...proveedor.value,
        comunaId: proveedor.value.comunaId ? Number(proveedor.value.comunaId) : null,
      },
    })
    messageSuccess.value = 'Proveedor creado exitosamente.'
    messageError.value = ''
    rutError.value = ''
    proveedor.value = {
      razonSocial: '',
      nombreFantasia: '',
      rut: '',
      telefono: '',
      email: '',
      direccion: '',
      giro: '',
      comunaId: '',
    }
    regionId.value = ''
    setTimeout(() => {
      messageSuccess.value = ''
      navigateTo('/proveedor')
    }, 6000)
  } catch (error: any) {
    messageError.value =
      error?.data?.message.join(', ') || 'Ocurrió un error al crear el proveedor.'
    messageSuccess.value = ''
    setTimeout(() => {
      messageError.value = ''
    }, 6000)
  }
}
</script>

<template>
  <section class="md:p-4 p-1">
    <article class="bg-base-100 shadow-md p-6 rounded-lg">
      <h1 class="text-2xl font-semibold mb-6">Crear Proveedor</h1>
      <p v-if="messageSuccess" class="text-success text-lg mb-4">
        {{ messageSuccess }}
      </p>
      <p v-if="messageError" class="text-error text-lg mb-4">
        {{ messageError }}
      </p>
      <form @submit="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Razón Social -->
        <label class="form-control w-full floating-label">
          <span>Razón Social</span>
          <input
            v-model="proveedor.razonSocial"
            type="text"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Nombre Fantasía -->
        <label class="form-control w-full floating-label">
          <span>Nombre Fantasía</span>
          <input
            v-model="proveedor.nombreFantasia"
            type="text"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- RUT -->
        <label class="form-control w-full floating-label">
          <span>RUT</span>
          <input
            v-model="proveedor.rut"
            @input="handleRutInput"
            @blur="handleRutBlur"
            type="text"
            class="input input-bordered w-full"
            :class="{ 'input-error': rutError }"
            maxlength="12"
            required
          />
          <p v-if="rutError" class="text-error text-sm mt-1">
            {{ rutError }}
          </p>
        </label>
        <!-- Teléfono -->
        <label class="form-control w-full floating-label">
          <span>Teléfono</span>
          <input
            v-model="proveedor.telefono"
            type="text"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Email -->
        <label class="form-control w-full floating-label">
          <span>Email</span>
          <input
            v-model="proveedor.email"
            type="email"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Dirección -->
        <label class="form-control w-full floating-label">
          <span>Dirección</span>
          <input
            v-model="proveedor.direccion"
            type="text"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Giro -->
        <label class="form-control w-full floating-label">
          <span>Giro</span>
          <input
            v-model="proveedor.giro"
            type="text"
            class="input input-bordered w-full"
            required
          />
        </label>
        <!-- Región -->
        <label class="form-control w-full floating-label">
          <span>Región</span>
          <select v-model="regionId" class="select select-bordered w-full" required>
            <option disabled value="">Seleccione región</option>
            <option v-for="region in regionesList" :key="region.id" :value="region.id">
              {{ region.nombre }}
            </option>
          </select>
        </label>
        <!-- Comuna -->
        <label class="form-control w-full floating-label">
          <span>Comuna</span>
          <select
            v-model="proveedor.comunaId"
            class="select select-bordered w-full"
            :disabled="!regionId"
            required
          >
            <option disabled value="">Seleccione comuna</option>
            <option v-for="comuna in comunasFiltradas" :key="comuna.id" :value="comuna.id">
              {{ comuna.nombre }}
            </option>
          </select>
        </label>
        <!-- Botón -->
        <button type="submit" class="btn btn-primary mt-4 col-span-full" :disabled="!isFormValid">
          Crear Proveedor
        </button>
      </form>
    </article>
  </section>
</template>
