<template>
  <div class="fixed left-0 top-0 z-50 flex size-full items-center justify-center bg-gray-900/50">
    <div class="rounded bg-white p-4 shadow-lg">
      <p class="mb-4">
        The feed is stale. Do you want to refresh?
      </p>
      <button
        class="rounded bg-blue-500 px-4 py-2 text-white"
        @click="emit('refreshFeed')"
      >
        Refresh
      </button>
      <button
        class="ml-2 rounded bg-gray-300 px-4 py-2 text-gray-700"
        @click="emit('closePrompt')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['refreshFeed', 'closePrompt'])
</script>
