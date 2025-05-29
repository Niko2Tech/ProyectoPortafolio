<script setup lang="ts">
import { useUserStore } from '#imports'

const userStore = useUserStore()
const useremail = userStore.usuario?.email
const mostrarMenu = ref(false)
const cambiarClave = () => {
  console.log('Cambiar clave clicked')
}
const cerrarSesion = () => {
  userStore.logout()
  navigateTo('/login')
}
</script>

<template>
  <header
    class="col-start-2 row-start-1 h-20 shadow flex items-center px-4 bg-base-100 justify-between"
  >
    <div class="flex items-center gap-4">
      <button class="btn btn-ghost btn-circle" @click="$emit('toggle-sidebar')">
        <Icon name="stash:burger-classic" class="text-xl" />
      </button>
      <div>
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
          <input type="search" class="grow" placeholder="Buscador" />
        </label>
      </div>
    </div>
    <div class="relative inline-block text-left">
      <div
        @click="mostrarMenu = !mostrarMenu"
        class="flex items-center gap-2 border rounded-xl p-2 border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors duration-150"
      >
        <div class="text-sm">
          <span class="font-semibold">{{ useremail }}</span>
        </div>
        <div class="avatar">
          <div class="rounded-full border border-base-300 bg-base-300 p-1">
            <Icon name="mdi:user" class="text-3xl" />
          </div>
        </div>
      </div>

      <!-- Menú desplegable con transición -->
      <transition name="fade-slide">
        <ul
          v-show="mostrarMenu"
          class="absolute right-0 z-10 mt-2 w-full rounded-box bg-base-100 p-2 shadow-md menu dropdown-content"
        >
          <li><a @click="cambiarClave">Cambiar clave</a></li>
          <li><a @click="cerrarSesion">Cerrar sesión</a></li>
        </ul>
      </transition>
    </div>
  </header>
</template>

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
