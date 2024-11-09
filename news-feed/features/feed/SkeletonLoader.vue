<template>
  <div class="animate-pulse border border-gray-300 py-2">
    <div class="mb-4 flex items-center">
      <div class="mr-4 size-12 rounded-full bg-gray-300" />
      <div>
        <div class="mb-2 h-4 w-24 bg-gray-300" />
        <div class="h-3 w-16 bg-gray-300" />
      </div>
    </div>
    <div class="mb-2 h-4 w-full bg-gray-300" />
    <div class="mb-2 h-4 w-3/4 bg-gray-300" />
    <div class="mb-4 h-4 w-2/4 bg-gray-300" />
    <div
      v-if="Math.random() < 0.5"
      class="mb-4 h-64 w-full bg-gray-300"
    />
    <div class="flex space-x-4">
      <div class="h-6 w-16 bg-gray-300" />
      <div class="h-6 w-16 bg-gray-300" />
    </div>
  </div>
</template>
