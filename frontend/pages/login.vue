<template>
  <main class="flex w-full h-screen items-center justify-center">
    <section class="card bg-base-100 w-96 shadow-sm p-6">
      <img src="/img/logo_texto.webp" />
      <form class="space-y-4" @submit.prevent="handleLogin">
        <!-- Email con ícono -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-2xl">Correo electrónico</span>
          </label>

          <label class="input input-bordered flex items-center gap-2">
            <!-- Ícono de email -->
            <svg class="h-5 w-5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>

            <input
              id="email"
              v-model="email"
              type="email"
              class="grow"
              placeholder="mail@ejemplo.com"
              required
              title="Ingresa un correo electrónico válido"
            />
          </label>

          <p class="text-sm text-red-500 leading-tight" v-if="emailError">
            Ingrese un correo electrónico válido (ej: usuario@dominio.com)
          </p>
        </div>

        <!-- Contraseña con validación -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-2xl">Contraseña</span>
          </label>

          <label class="input input-bordered flex items-center gap-2">
            <!-- Ícono decorativo -->
            <svg class="h-5 w-5 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                stroke-linejoin="round"
                stroke-linecap="round"
                stroke-width="2.5"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                ></path>
                <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
              </g>
            </svg>

            <input
              id="password"
              v-model="password"
              :type="viewPassword ? 'text' : 'password'"
              class="grow"
              placeholder="*********"
              required
              minlength="8"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title="Debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número"
            />
          </label>
        </div>
        <div class="form-control">
          <label class="label">
            <input type="checkbox" class="checkbox checkbox-sm" @click="viewPasswordToggle()" />
            <span class="label-text">Mostrar contraseña</span>
          </label>
        </div>

        <!-- Botón -->
        <button type="submit" class="btn btn-primary w-full text-xl">Ingresar</button>

        <!-- Mensaje de error -->
        <p v-if="errorMessage" class="text-error text-sm text-center mt-2">
          {{ errorMessage }}
        </p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
interface LoginForm {
  email: string
  password: string
}
const email = ref('')
const emailError = ref(false)
const password = ref('')
const errorMessage = ref('')
const viewPassword = ref(false)
const userStore = useUserStore()

// Watchers para ocultar el mensaje de error cuando el usuario edite los campos
watch(email, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

watch(password, () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

const viewPasswordToggle = () => {
  viewPassword.value = !viewPassword.value
}

const handleLogin = async () => {
  try {
    await userStore.login({
      email: email.value,
      password: password.value,
    })
    errorMessage.value = ''
    navigateTo('/dashboard')
  } catch (error: any) {
    errorMessage.value = error.message || 'Error al iniciar sesión'
  }
}
</script>
