<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const user = userStore.usuario
</script>

<template>
  <div class="">
    <h1>Ruta productos</h1>
    <p v-if="user">Holaa, {{ user.nombre }}!</p>
    <NuxtLink to="/home">home</NuxtLink>
  </div>
</template>
