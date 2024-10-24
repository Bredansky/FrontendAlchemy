<template>
  <div class="relative p-2">
    <!-- Hidden div for enriched content -->
    <div
      class="pointer-events-none absolute left-2 top-2 z-0 h-24 w-[calc(100%_-_1rem)] overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-300 bg-white p-2"
      v-html="enrichContent(content)"
    />

    <!-- Textarea -->
    <textarea
      v-model="content"
      placeholder="Write your post here"
      class="relative z-10 h-24 w-full whitespace-pre-wrap rounded-md border border-gray-300 bg-transparent p-2 text-transparent caret-black"
    />

    <div class="mt-2 flex items-center justify-between">
      <label class="flex items-center text-gray-700">
        <input
          v-model="addFancyPicture"
          type="checkbox"
          class="mr-2 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        >
        Add fancy picture
      </label>
      <button
        class="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        :disabled="isPostButtonDisabled"
        @click="postNewPost"
      >
        Post
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const content = ref('')
const addFancyPicture = ref(false)

const isPostButtonDisabled = computed(() => {
  return content.value.trim() === '' && !addFancyPicture.value
})

const { postNewPost } = await usePostSubmission(content, addFancyPicture)
</script>
