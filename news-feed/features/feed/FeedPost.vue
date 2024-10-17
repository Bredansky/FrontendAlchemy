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
          {{ formatRelativeTime(post.createdAt) }}
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
        isPoorConnection() && !imageLoaded && lowResImageUrl && post.imageUrl
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
      v-else-if="(isFastConnection() && post.imageUrl) || imageLoaded"
      ref="imageRef"
      class="overflow-hidden rounded-lg"
    >
      <img
        v-if="imageSrc"
        :src="imageSrc"
        alt="Post Image"
        class="min-w-full"
        :srcset="`
          ${generateImageUrl(imageSrc, 320, 180)} 320w,
          ${generateImageUrl(imageSrc, 640, 360)} 640w,
          ${generateImageUrl(imageSrc, 768, 432)} 768w,
          ${generateImageUrl(imageSrc, 1024, 576)} 1024w,
          ${generateImageUrl(imageSrc, 1280, 720)} 1280w,
        `"
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
  root: Element | null
}>()

const { user } = await useUser('4')

const { userReactions, postReactions, toggleReaction } = usePostReactions(
  props.post,
  user.value!.id.toString(),
)

const formatRelativeTime = (timestamp: Date) => {
  const now = new Date()
  const postDate = new Date(timestamp)
  const timeDifference = Number(now) - Number(postDate)

  const seconds = Math.floor(timeDifference / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  // If the post is older than 1 day, return the formatted date
  if (days >= 1) {
    return formatDate(timestamp)
  }
  else if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`
  }
  else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  }
  else if (seconds >= 10) {
    return `${seconds} second${seconds === 1 ? '' : 's'} ago`
  }
  else {
    return 'Just now'
  }
}

const formatDate = (timestamp: Date) => {
  const userLocale = import.meta.client
    ? navigator.language || navigator.languages[0]
    : 'en-US'

  const date = new Date(timestamp)

  const formattedTime = new Intl.DateTimeFormat(userLocale, {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23', // or 'h12'
  }).format(date)

  const formattedDate = new Intl.DateTimeFormat(userLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)

  return `${formattedTime} · ${formattedDate}`
}

// Truncation logic

const maxChars = 300 // Max number of characters to display before truncation
const isExpanded = ref(false)
const postHeight = ref(props.post.height + 'px')
// const postHeight = computed(() => {
//   console.log(isExpanded.value);
//   return isExpanded.value ? "unset" : props.post.height + "px";
// });
// TODO: Computed no needed actually
const shouldTruncate = computed(() => props.post.content.length > maxChars)

// Toggle expansion of the content
const toggleExpand = () => {
  postHeight.value = 'unset'
  isExpanded.value = !isExpanded.value
  emitResize()
}

// Display content (either truncated or full)
const displayContent = computed(() => {
  if (isExpanded.value || !shouldTruncate.value) {
    return enrichContent(props.post.content)
  }
  return enrichContent(props.post.content.substring(0, maxChars).trim() + '...')
})

// Emit resize event
const emit = defineEmits(['resize'])
const emitResize = () => {
  emit('resize', props.post.id)
}

const enrichContent = (text: string) => {
  const hashtagPattern = /#(\w+)/g
  const mentionPattern = /@(\w+)/g

  const newContent = text
    .replace(
      hashtagPattern,
      '<span class="text-blue-500 font-semibold">#$1</span>',
    )
    .replace(
      mentionPattern,
      '<span class="text-blue-500 font-semibold">@$1</span>',
    )

  return newContent
}

const imageSrc = ref('')
const imageRef = ref(null)
const imageLoaded = ref(false)

const isFastConnection = () => {
  if (import.meta.client && navigator.connection) {
    const connectionType = navigator.connection.effectiveType
    return connectionType === '4g' || navigator.connection.saveData === false
  }
  return true
}

// TODO: Get rid off
const isPoorConnection = (): boolean => {
  return !isFastConnection()
}

const generateLowResImageUrl = (url: string) => {
  if (!url) return ''

  const urlParts = url.split('/')

  const lowResWidth = '80'
  const lowResHeight = '45'

  urlParts[urlParts.length - 2] = lowResWidth
  urlParts[urlParts.length - 1] = lowResHeight

  return urlParts.join('/') + '?blur=3'
}

// TODO: Call this function once for the whole srcset lmao
const generateImageUrl = (url: string, width: number, height: number) => {
  if (!url) return ''

  const urlParts = url.split('/')

  urlParts[urlParts.length - 2] = width.toString()
  urlParts[urlParts.length - 1] = height.toString()

  return urlParts.join('/') + '.webp'
}

const lowResImageUrl = generateLowResImageUrl(props.post.imageUrl || '')

const handleVisibilityChange = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (isFastConnection()) {
        imageSrc.value = props.post.imageUrl || '' // Fallback to empty string if null
      }
      observer.unobserve(entry.target)
    }
  })
}

const loadHighResImage = () => {
  imageSrc.value = props.post.imageUrl || ''
  imageLoaded.value = true
}

const relativeTimestamp = ref('')

const updateTimestamp = () => {
  relativeTimestamp.value = formatRelativeTime(props.post.createdAt)
}

onMounted(() => {
  const connectionIsFast = isFastConnection()

  if (imageRef.value) {
    if (connectionIsFast) {
      // For fast connections, use IntersectionObserver with a rootMargin
      const observer = new IntersectionObserver(handleVisibilityChange, {
        root: props.root,
        rootMargin: '500px', // Pre-fetch the image
      })
      observer.observe(imageRef.value)
    }
  }

  updateTimestamp()

  const postDate = new Date(props.post.createdAt)
  const now = new Date()
  const timeDifference = Number(now) - Number(postDate)

  if (timeDifference < 24 * 60 * 60 * 1000) {
    // Update every minute if the post is less than 24 hours old
    const interval = setInterval(() => {
      updateTimestamp()
    }, 60000)

    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})
</script>
