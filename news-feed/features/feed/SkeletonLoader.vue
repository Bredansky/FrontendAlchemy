<template>
  <div class="animate-pulse py-2 border border-gray-300">
    <div class="flex items-center mb-4">
      <div class="bg-gray-300 w-12 h-12 rounded-full mr-4"></div>
      <div>
        <div class="bg-gray-300 w-24 h-4 mb-2"></div>
        <div class="bg-gray-300 w-16 h-3"></div>
      </div>
    </div>
    <div class="bg-gray-300 w-full h-4 mb-2"></div>
    <div class="bg-gray-300 w-3/4 h-4 mb-2"></div>
    <div class="bg-gray-300 w-2/4 h-4 mb-4"></div>
    <div v-if="Math.random() < 0.5" class="bg-gray-300 w-full h-64 mb-4"></div>
    <div class="reactions flex space-x-4">
      <div class="bg-gray-300 w-16 h-6"></div>
      <div class="bg-gray-300 w-16 h-6"></div>
    </div>
  </div>
</template>
