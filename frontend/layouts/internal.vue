<script setup lang="ts">
import { LayoutsComponentHeaderComponent } from '#components'
import { useRoute } from 'vue-router'

const sidebarMenu = ref(true)
const route = useRoute()
const menuAbierto = ref('')

const toggleSidebar = () => {
  sidebarMenu.value = !sidebarMenu.value
}

watchEffect(() => {
  menuAbierto.value = route.path.split('/')[1] || ''
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
              <NuxtLink to="/caja" class="flex items-center gap-2 w-full">
                <Icon name="mdi:cash-register" />
                <span>Caja diaria</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'caja'" class="mt-1">
                  <li>
                    <NuxtLink to="/caja/historial">
                      <Icon name="mdi:history" />
                      Historial
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
            <li>
              <NuxtLink to="/dashboard">
                <Icon name="carbon:dashboard" />
                Dashboard
              </NuxtLink>
            </li>

            <!-- Menú desplegable de Inventario -->
            <li>
              <NuxtLink to="/inventario" class="flex items-center gap-2 w-full">
                <Icon name="mingcute:inventory-line" />
                <span>Inventario</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'inventario'" class="mt-1">
                  <li>
                    <NuxtLink to="/inventario/crear">
                      <Icon name="mdi:invoice-text-new-outline" />
                      Crear producto
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/inventario/editar">
                      <Icon name="mdi:edit-outline" />
                      Editar producto
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/inventario/movimientos">
                      <Icon name="mdi:swap-horizontal" />
                      Movimientos
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>

            <!-- Menú desplegable de Ventas -->
            <li>
              <NuxtLink to="/venta" class="flex items-center gap-2 w-full">
                <Icon name="mdi:point-of-sale" />
                <span>Ventas</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'venta'" class="mt-1">
                  <li>
                    <NuxtLink to="/venta/editar">
                      <Icon name="mdi:edit-outline" />
                      Editar venta
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/venta/historial">
                      <Icon name="mdi:history" />
                      Historial
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>

            <!-- Menú desplegable de Clientes -->
            <!--
            <li>
              <NuxtLink to="/cliente" class="flex items-center gap-2 w-full">
                <Icon name="mdi:account-group" />
                <span>Clientes</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'cliente'" class="mt-1">
                  <li>
                    <NuxtLink to="/cliente/crear">
                      <Icon name="mdi:account-plus" />
                      Crear cliente
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/cliente/editar">
                      <Icon name="mdi:account-edit" />
                      Editar cliente
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
            -->

            <!-- Menú desplegable de Proveedores -->
            <li>
              <NuxtLink to="/proveedor" class="flex items-center gap-2 w-full">
                <Icon name="material-symbols:store" />
                <span>Proveedores</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'proveedor'" class="mt-1">
                  <li>
                    <NuxtLink to="/proveedor/crear">
                      <Icon name="mdi:plus" />
                      Crear proveedor
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/proveedor/editar">
                      <Icon name="mdi:edit-outline" />
                      Editar proveedor
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>

            <!-- Menú desplegable de Compras -->
            <li>
              <NuxtLink to="/compra" class="flex items-center gap-2 w-full">
                <Icon name="mdi:invoice-text-new-outline" />
                <span>Compras</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'compra'" class="mt-1">
                  <li>
                    <NuxtLink to="/compra/crear">
                      <Icon name="mdi:invoice-text-new-outline" />
                      Crear compra
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/compra/editar">
                      <Icon name="mdi:edit-outline" />
                      Editar compra
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/compra/cambiarEstado">
                      <Icon name="mdi:swap-horizontal" />
                      Cambiar estado
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
            <!-- Menú desplegable de Gastos -->
            <!--
            <li>
              <NuxtLink to="/gasto" class="flex items-center gap-2 w-full">
                <Icon name="mdi:cash-minus" />
                <span>Gastos</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'gasto'" class="mt-1">
                  <li>
                    <NuxtLink to="/gasto/crear">
                      <Icon name="mdi:cash-plus" />
                      Crear gasto
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/gasto/editar">
                      <Icon name="mdi:pencil" />
                      Editar gasto
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/gasto/historial">
                      <Icon name="mdi:history" />
                      Historial
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
            -->
            <!-- Menú desplegable de Usuarios -->
            <!--
            <li>
              <NuxtLink to="/usuarios" class="flex items-center gap-2 w-full">
                <Icon name="mdi:account-multiple" />
                <span>Usuarios</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'usuarios'" class="mt-1">
                  <li>
                    <NuxtLink to="/usuarios/crear">
                      <Icon name="mdi:account-plus" />
                      Crear usuario
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/usuarios/editar">
                      <Icon name="mdi:account-edit" />
                      Editar usuario
                    </NuxtLink>
                  </li>
                </ul>
              </transition>
            </li>
            -->

            <!-- Menú desplegable de Configuración -->
            <li>
              <NuxtLink to="/configuracion" class="flex items-center gap-2 w-full">
                <Icon name="mdi:cog" />
                <span>Configuración</span>
              </NuxtLink>
              <transition name="fade-slide">
                <ul v-show="menuAbierto == 'configuracion'" class="mt-1">
                  <li>
                    <NuxtLink to="/configuracion/categorias">
                      <Icon name="mdi:folder" />
                      Categorías
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/configuracion/subcategorias">
                      <Icon name="mdi:folder-outline" />
                      Subcategorías
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/configuracion/marcas">
                      <Icon name="mdi:trademark" />
                      Marcas
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/configuracion/metodos-pago">
                      <Icon name="mdi:credit-card-settings" />
                      Métodos de Pago
                    </NuxtLink>
                  </li>
                  <!--<li>
                    <NuxtLink to="/configuracion/tipos-gasto">
                      <Icon name="mdi:tag-multiple" />
                      Tipos de Gasto
                    </NuxtLink>
                  </li>-->
                </ul>
              </transition>
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
