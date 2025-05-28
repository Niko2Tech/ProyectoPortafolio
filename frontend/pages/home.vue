<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const user = userStore.usuario
</script>

<template>
  <div class="home">
    <h1>Ruta segura home</h1>
    <p v-if="user">Holaa, {{ user.nombre }}!</p>
    <NuxtLink to="/product">Product</NuxtLink>
  </div>
</template>
