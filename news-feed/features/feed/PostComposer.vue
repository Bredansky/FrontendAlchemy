<template>
  <div class="relative p-2">
    <!-- Hidden div for enriched content -->
    <div
      class="pointer-events-none absolute left-2 top-2 z-0 h-24 w-[calc(100%_-_1rem)] overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-300 bg-white p-2"
      v-html="enrichedContent"
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
import { faker } from '@faker-js/faker'
import type { AuthoredPostWithHeight } from './FeedPost.vue'
import type { SelectUser } from '~/db/schema'

const route = useRoute()
const viewPortWidth = useState('viewPortWidth', () => 0)
const posts = useState<AuthoredPostWithHeight[]>('posts', () => [])
const user = useState<SelectUser>('user', () => ({
  createdAt: new Date(),
  nickname: 'Unknown',
  profilePhotoUrl: '',
  id: 0,
}))
const content = ref('')
const addFancyPicture = ref(false)
const isPostButtonDisabled = computed(() => {
  return content.value.trim() === '' && !addFancyPicture.value
})

// Function to post a new post
const postNewPost = async () => {
  // TODO: To the constant image config or something
  const randomImage
    = faker.image.urlPicsumPhotos({ width: 320, height: 180 }) + '.webp'

  const dummyPost = {
    id: parseInt(Math.random().toString().slice(2, 9), 10),
    content: content.value,
    author: { ...user.value },
    imageUrl: addFancyPicture.value ? randomImage : null,
    reactions: {
      likes: 0,
      hahas: 0,
    },
    currentUserReaction: {
      liked: false,
      hahaed: false,
    },
    createdAt: new Date(),
    authorId: user.value.id,
    height: 0,
  }

  // TODO: Set propper width
  dummyPost.height = calculatePostHeight(dummyPost, viewPortWidth.value)

  // Optimistic update
  posts.value = [dummyPost, ...posts.value]

  // Save to server
  try {
    // TODO: key chained stores of users posts and reactions!!!!! !! ! ! ! !  !
    // TODO: update specific post in state after fetching
    const { newPost } = await $fetch<{
      newPost: { lastInsertRowid: number }
    }>('api/posts', {
      method: 'POST',
      body: {
        imageUrl: addFancyPicture.value ? randomImage : null,
        content: content.value,
        authorId: user.value.id,
      },
    })

    posts.value = posts.value.map((post) => {
      if (post.id === dummyPost.id) {
        return {
          ...post,
          id: newPost.lastInsertRowid,
        }
      }
      return post
    })
  }
  catch (error) {
    // Revert changes on error
    posts.value = posts.value.filter(post => post.id !== dummyPost.id)
    console.error('Error posting new post:', error)
  }

  // Clear input
  content.value = ''

  if (route.name !== 'feed') {
    navigateTo('/feed')
  }
}

// Computed property to enrich content
const enrichedContent = computed(() => {
  const hashtagPattern = /#(\w+)/g
  const mentionPattern = /@(\w+)/g

  const newContent = content.value
    .replace(hashtagPattern, '<span class="text-blue-500">#$1</span>')
    .replace(mentionPattern, '<span class="text-blue-500">@$1</span>')

  return newContent
})
</script>
