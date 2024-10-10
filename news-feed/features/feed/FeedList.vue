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
  <ErrorState @on-retry="refreshFeed" />
  <PostComposer class="hidden border-b border-gray-300 md:block" />
  <LazyStaleFeedPrompt
    v-if="showPrompt"
    @close-prompt="showPrompt=false"
    @refresh-feed="refreshFeed"
  />
  <VirtualizedList :fetch-data="fetchData" />
  <NuxtLink
    href="compose"
    class="absolute bottom-10 right-5 flex size-14 items-center justify-center rounded-full bg-blue-400 shadow-md md:hidden"
  >
    <WriteIcon class="size-8" />
  </NuxtLink>
</template>

<script setup lang="ts">
// TODO: Separate types folder or something
import type { AuthoredPostWithHeight } from './FeedPost.vue'
import type { SelectUser } from '~/db/schema'

const showPrompt = ref(false)

const user = useState<SelectUser | null>('user', () => null)
const posts = useState<AuthoredPostWithHeight[]>('posts', () => [])
const cursor = useState('cursor', () => '')
const errorState = useState('errorState', () => '')

user.value = await $fetch<{ user: SelectUser }>('/api/users/4').then(result => result.user)

const fetchData = async (size: number, nextCursor: string) => {
  try {
    if (!user.value) {
      errorState.value = 'Failed to fetch user'
      return {
        posts: [],
        pagination: { next_cursor: null },
      }
    }

    const res = await $fetch<{
      posts: AuthoredPostWithHeight[]
      pagination: { next_cursor: string | null }
    }>('/api/posts', {
      query: { size, cursor: nextCursor, userId: user.value.id },
    })

    return res
  }
  catch (error) {
    console.error('Error fetching posts:', error)
    errorState.value = 'Failed to fetch posts'

    // Always return an empty structure in case of error
    return {
      posts: [],
      pagination: { next_cursor: null },
    }
  }
}

const refreshFeed = async () => {
  posts.value = []
  cursor.value = ''
  showPrompt.value = false
  window.scrollTo(0, 0)
  await fetchData(10, '')
}
</script>
