<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div class="form-control">
      <label class="label">
        <span class="label-text">Monto de apertura</span>
      </label>
      <input
        v-model.number="montoApertura"
        type="number"
        min="0"
        class="input input-bordered w-full"
        required
      />
    </div>
    <div class="form-control">
      <label class="label">
        <span class="label-text">Comentario (opcional)</span>
      </label>
      <textarea v-model="comentario" class="textarea textarea-bordered w-full" rows="2" />
    </div>
    <div v-if="error" class="alert alert-error shadow-sm">{{ error }}</div>
    <button class="btn btn-primary w-full" :disabled="loading">
      <span v-if="loading" class="loading loading-spinner"></span>
      Abrir caja
    </button>
  </form>
</template>
<script setup lang="ts">
const props = defineProps<{ loading: boolean; error: string | null }>()
const emit = defineEmits(['submit'])
const montoApertura = ref(0)
const comentario = ref('')
function onSubmit() {
  emit('submit', { montoApertura: montoApertura.value, comentario: comentario.value })
}
</script>
