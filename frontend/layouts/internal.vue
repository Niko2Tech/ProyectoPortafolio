<script setup lang="ts">
import { LayoutsComponentHeaderComponent } from '#components'
import { useRoute } from 'vue-router'

const sidebarMenu = ref(true)
const route = useRoute()
const inventarioAbierto = ref(false)

const toggleSidebar = () => {
  sidebarMenu.value = !sidebarMenu.value
}

watchEffect(() => {
  inventarioAbierto.value = route.path.startsWith('/inventario')
})
</script>

<template>
  <div
    class="grid grid-rows-[5rem_1fr] min-h-screen bg-slate-100 transition-all duration-300"
    :class="sidebarMenu ? 'grid-cols-[12rem_1fr]' : 'grid-cols-[0rem_1fr]'"
  >
    <!-- Header -->
    <LayoutsComponentHeaderComponent @toggle-sidebar="toggleSidebar" />
    <!-- Sidebar -->
    <transition name="slide-left">
      <aside
        v-if="sidebarMenu"
        class="col-start-1 row-span-2 shadow p-4 bg-base-100 transition-all duration-300"
      >
        <div class="flex items-center mb-4 justify-between">
          <img src="/img/logo_texto.webp" alt="Logo" class="rounded w-40 mx-auto" />
        </div>
        <nav>
          <ul class="menu gap-2 w-full">
            <li>
              <NuxtLink to="/dashboard">
                <Icon name="carbon:dashboard" />
                Dashboard
              </NuxtLink>
            </li>

            <!-- Menú desplegable de Inventario -->
            <li>
              <NuxtLink
                to="/inventario"
                class="flex items-center gap-2 w-full"
                @click="inventarioAbierto = !inventarioAbierto"
              >
                <Icon name="mingcute:inventory-line" />
                <span>Inventario</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="inventarioAbierto" class="mt-1">
                  <li>
                    <NuxtLink to="/inventario/buscar">
                      <Icon name="mdi:magnify" />
                      Buscar producto
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/inventario/crear">
                      <Icon name="material-symbols:add-box-outline-rounded" />
                      Crear producto
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/inventario/editar">
                      <Icon name="material-symbols:edit-outline" />
                      Editar producto
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
            <li>
              <NuxtLink to="/proveedor">
                <Icon name="material-symbols:store" />
                Proveedores
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>
    </transition>
    <!-- Contenido -->
    <main class="col-start-2 row-start-2 overflow-y-auto w-full min-h-screen">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.router-link-active,
.router-link-exact-active {
  background-color: #bd353a;
  color: #fff;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
