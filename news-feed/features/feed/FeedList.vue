<template>
  <NuxtLink
    to="/profile"
    class="flex items-center gap-1 border-b p-1"
  >
    <img
      :src="user?.profilePhotoUrl"
      class="rounded-full"
      width="32"
    >
    <p>{{ user?.nickname }}</p>
  </NuxtLink>
  <ErrorState @on-retry="refreshData" />
  <PostComposer class="hidden border-b border-gray-300 md:block" />
  <LazyStaleFeedPrompt
    v-if="isDataStale"
    @close-prompt="isDataStale=false"
    @refresh-feed="refreshData"
  />
  <VirtualizedList
    ref="virtualizedList"
    :fetch-data="fetchData"
  />
  <NuxtLink
    href="compose"
    class="absolute bottom-10 right-5 flex size-14 items-center justify-center rounded-full bg-blue-400 shadow-md md:hidden"
  >
    <WriteIcon class="size-8" />
  </NuxtLink>
</template>

<script setup lang="ts">
import type VirtualizedList from './VirtualizedList.vue'

const { user } = await useUser('4')
const { fetchData, isDataStale } = fetchPosts('4')
const virtualizedList = ref<InstanceType<typeof VirtualizedList> | null>(null) // Type the ref correctly

const refreshData = () => {
  if (virtualizedList.value) {
    virtualizedList.value.refreshPosts() // Call refresh method in VirtualizedList
  }
}
</script>
