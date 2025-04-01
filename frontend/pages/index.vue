<template>
  <header
    class="fixed top-0 flex justify-between items-center mx-auto p-4 bg-white shadow-md w-full"
  >
    <h1 class="text-2xl font-bold text-gray-800">Proyecto de portafolio</h1>
    <img src="/img/logo_duoc.webp" alt="logo duoc uc" class="w-64" />
  </header>

  <main class="h-full w-full flex flex-col items-center justify-center text-center p-6 mt-20">
    <!--<img src="/img/inventory_system.webp" alt="Gestor de Inventario" class="w-80 mb-4" />-->
    <h2 class="text-3xl font-bold text-gray-900">Gestor de Inventario y Punto de Venta</h2>
    <p class="text-lg text-gray-700 max-w-2xl mt-2">
      Nuestro proyecto es un sistema de gestión de inventario y punto de venta, construido con
      NestJS en el backend y Nuxt en el frontend.
    </p>
    <h3 class="text-2xl my-2 font-semibold">Tecnologias utilizadas</h3>
    <div class="relative flex flex-col items-center">
      <img src="/img/javascript.png" alt="JavaScript" class="w-32 mb-4" />
      <div class="flex space-x-16">
        <img src="/img/vue.png" alt="Vue.js" class="w-32" />
        <img src="/img/node.png" alt="Node.js" class="w-32" />
      </div>
      <div class="flex justify-between w-full mt-4 px-10 gap-4">
        <img src="/img/nuxt.svg" alt="Nuxt.js" class="w-32" />
        <img src="/img/postgres.png" alt="MySQL" class="w-32 mt-6" />
        <img src="/img/nest.svg" alt="NestJS" class="w-32" />
      </div>
    </div>
  </main>
  <footer class="fixed bottom-0 w-full bg-gray-900 text-white text-center py-4 mt-4">
    <p class="">
      &copy; {{ new Date().getFullYear() }} Proyecto desarrollado por Andrés Quiroz, Nicolás Jiménez
      y Cristian Matus. Licencia MIT.
    </p>
  </footer>
</template>

<script setup></script>
