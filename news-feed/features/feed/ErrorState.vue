<template>
  <div
    v-if="errorState"
    class="flex flex-col items-center justify-center"
  >
    <div class="text-center">
      <p class="text-lg font-semibold text-red-600">
        Oops! Something went wrong.
      </p>
      <p class="text-sm text-gray-600">
        {{ errorState }}
      </p>
      <button
        class="mt-4 rounded bg-blue-600 px-2 py-1 font-medium text-white transition hover:bg-blue-700"
        @click="emit('onRetry')"
      >
        Retry
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'onRetry'): void
}>()

const errorState = useState('errorState', () => '')
</script>
