<template>
  <div
    class="space-y-1 border-b border-gray-300"
    :style="{ height: postHeight }"
  >
    <div class="flex items-center">
      <img
        :src="post.author.profilePhotoUrl"
        alt="Profile Picture"
        class="mr-4 size-12 rounded-full"
      >
      <div>
        <p class="mb-1 font-semibold">
          {{ post.author.nickname }}
        </p>
        <p class="text-sm text-gray-500">
          {{ relativeTimestamp }}
        </p>
      </div>
    </div>
    <p v-html="displayContent" />

    <p
      v-if="shouldTruncate"
      class="text-blue-500 underline"
      @click="toggleExpand"
    >
      {{ isExpanded ? "See less" : "See more" }}
    </p>

    <div
      v-if="
        !isFastConnection && !imageLoaded && lowResImageUrl && post.imageUrl
      "
      class="relative aspect-video w-full"
    >
      <img
        :src="lowResImageUrl"
        alt="Low Resolution Post Image"
        class="mb-2 w-full cursor-pointer rounded-lg"
      >
      <div
        class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/50"
        @click="loadHighResImage"
      >
        <span class="text-lg font-semibold text-white">Click to Load</span>
      </div>
    </div>
    <div
      v-else-if="(isFastConnection && post.imageUrl) || imageLoaded"
      ref="imageRef"
      class="overflow-hidden rounded-lg"
    >
      <img
        v-if="imageSrc"
        :src="imageSrc"
        alt="Post Image"
        class="min-w-full"
        :srcset="srcset"
      >
    </div>

    <div class="flex justify-between text-sm text-gray-700">
      <button
        :class="{
          'bg-blue-500 font-semibold text-white': userReactions.liked,
          'bg-gray-200 text-gray-700': !userReactions.liked,
        }"
        class="rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="toggleReaction('liked')"
      >
        👍 {{ postReactions.likes }}
      </button>
      <button
        :class="{
          'bg-blue-500 font-semibold text-white': userReactions.hahaed,
          'bg-gray-200 text-gray-700': !userReactions.hahaed,
        }"
        class="rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @click="toggleReaction('hahaed')"
      >
        😂 {{ postReactions.hahas }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthoredPost } from '~/server/api/posts.get'

// TODO: To types or something
export interface AuthoredPostWithHeight extends AuthoredPost {
  height: number
}

const props = defineProps<{
  post: AuthoredPostWithHeight
  root: HTMLElement | null
}>()

const { user } = await useUser('4')

const { userReactions, postReactions, toggleReaction } = usePostReactions(
  props.post,
  user.value!.id.toString(),
)

const imageRef = ref<HTMLImageElement | null>(null)

const {
  imageSrc,
  imageLoaded,
  lowResImageUrl,
  loadHighResImage,
  srcset,
} = useImageHandling(
  props.post,
  props.root,
  imageRef,
)

const isFastConnection = useFastConnection()

const relativeTimestamp = usePostTimestamp(props.post)

const emit = defineEmits(['resize'])
const emitResize = () => {
  emit('resize', props.post.id)
}

const { isExpanded, shouldTruncate, toggleExpand, displayContent, postHeight } = useTextTruncate(props.post, 300, emitResize)
</script>
