<template>
  <div
    ref="root"
    :style="rootStyle"
    class="overflow-auto"
  >
    <div
      ref="viewport"
      :style="viewportStyle"
      class="mx-auto min-w-80 max-w-screen-xl border border-t-0 border-gray-300"
    >
      <div
        ref="spacer"
        :style="spacerStyle"
      >
        <FeedPost
          v-for="post in visibleItems"
          :key="post.id"
          :post="post"
          :root="root"
          @resize="handleResize"
        />
      </div>
    </div>
    <div v-if="loading">
      <SkeletonLoader
        v-for="i in 4"
        :key="'loader' + i"
      />
    </div>
    <div
      ref="sentinel"
      class="h-px"
    />
  </div>
</template>

<script setup lang="ts">
import type { AuthoredPostWithHeight } from './FeedPost.vue'

const props = defineProps({
  fetchData: {
    type: Function as PropType<(size: number, cursor: string) => Promise<{
      posts: AuthoredPostWithHeight[]
      pagination: { next_cursor: string | null }
    }>>,
    required: true,
  },
})

const STALE_FEED_DURATION = 3 * 60 * 60 * 1000 // 3 hours in milliseconds
const showPrompt = ref(false)

const sentinel = ref(null)

const posts = useState<AuthoredPostWithHeight[]>('posts', () => [])

const lastFetchTime = useState('lastFetchTime', () => Date.now())

let intersectionObserver: IntersectionObserver

const errorState = useState('errorState', () => '')
const cursor = useState<string | null>('cursor', () => null)

const handleResize = (postId: number) => {
  posts.value = posts.value.map((post) => {
    if (post.id === postId) {
      post.height = calculatePostHeight(post, viewPortWidth.value)
    }
    return post
  })
}

const checkForStaleFeed = () => {
  const currentTime = Date.now()
  const timeElapsed = currentTime - lastFetchTime.value

  if (timeElapsed > STALE_FEED_DURATION) {
    // Prompt the user to refresh
    showPrompt.value = true
  }
}

watch(posts, (newPosts) => {
  if (newPosts.length === 0) {
    root.value?.scrollTo(0, 0)
  }
})

const fetchPosts = async () => {
  loading.value = true

  errorState.value = ''

  try {
    const postsToFetch = Math.ceil(viewportHeight.value / MINIMAL_POST_HEIGHT) + BUFFER_AMOUNT_OF_POSTS

    const data = await props.fetchData(postsToFetch, cursor.value || '')

    posts.value = [
      ...posts.value,
      ...data.posts.map((post) => {
        post.height = calculatePostHeight(post, viewPortWidth.value)
        return post
      }),
    ]
    cursor.value = data.pagination.next_cursor
    lastFetchTime.value = Date.now()
    loading.value = false

    if (!data.pagination.next_cursor) {
      if (sentinel.value) {
        intersectionObserver.unobserve(sentinel.value)
      }
    }
  }
  catch (error) {
    console.error('Error fetching posts:', error)
    errorState.value = 'Failed to load posts. Please try again.'
  }
  finally {
    loading.value = false
  }
}

const rootHeight = ref(0)

const scrollTop = useState('scrollTop', () => 0)

const loading = ref(false)

const root = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const viewPortWidth = useState('viewPortWidth', () => 0)
const spacer = ref(null)

const viewportHeight = computed(() => {
  if (posts.value.length === 0) {
    return 0
  }
  return posts.value.reduce((acc, cur) => {
    return acc + cur.height
  }, 0)
})

const startIndex = computed(() => {
  let sum = 0
  let index = 0

  while (sum < scrollTop.value && index < posts.value.length) {
    const itemHeight = posts.value[index].height
    sum += itemHeight !== undefined ? itemHeight : 0
    index++
  }
  return Math.max(0, index - 1)
})

const visibleNodeCount = computed(() => {
  if (posts.value.length === 0) {
    return 0
  }
  let count = 1
  let index = startIndex.value + 1
  let sum
    = posts.value[startIndex.value].height - (scrollTop.value - offsetY.value)

  while (index < posts.value.length && sum < rootHeight.value) {
    const itemHeight = posts.value[index].height
    sum += itemHeight !== undefined ? itemHeight : 0
    count++
    index++
  }

  return count
})

const visibleItems = computed<AuthoredPostWithHeight[]>(() =>
  posts.value.slice(
    startIndex.value,
    startIndex.value + visibleNodeCount.value,
  ),
)

const offsetY = computed(() => {
  // Sum the height of all items before the start index
  return posts.value.slice(0, startIndex.value).reduce((acc, item) => {
    return acc + (item.height || 0) // Ensure height defaults to 0 if undefined
  }, 0)
})

const rootStyle = computed(() => {
  return {
    height: `${rootHeight.value}px`,
  }
})

const viewportStyle = computed(() => ({
  height: `${viewportHeight.value}px`,
}))

const spacerStyle = computed(() => ({
  transform: `translateY(${offsetY.value}px)`,
}))

const handleScroll = () => {
  scrollTop.value = root.value?.scrollTop || 0
}

const updateRootHeight = () => {
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  )
  // TODO: No magic numbers
  // TODO: Add to some sort of measurments config or something in utils
  // TODO: Set those values to the specific components as well to sctrictly control them
  rootHeight.value = vh - (root.value?.offsetWidth || 0 < 768 ? 41 : 41 + 167)
}

const updatePostsHeight = () => {
  posts.value.map((post) => {
    post.height = calculatePostHeight(post, viewPortWidth.value)
    return post
  })
}

onMounted(async () => {
  viewPortWidth.value = viewport.value?.offsetWidth || 0
  fetchPosts()
  updateRootHeight()
  updatePostsHeight()
  window.addEventListener('resize', () => {
    viewPortWidth.value = viewport.value?.offsetWidth || 0
    updateRootHeight()
    updatePostsHeight()
  })

  if (root.value) {
    root.value.scrollTop = scrollTop.value
  }

  const doesBrowserSupportPassiveScroll = () => {
    let passiveSupported = false
    try {
      const options = {
        get passive() {
          passiveSupported = true
          return false
        },
      }

      window.addEventListener('test', () => {}, options)
      window.removeEventListener('test', () => {})
    }
    catch {
      passiveSupported = false
    }

    return passiveSupported
  }

  root.value?.addEventListener(
    'scroll',
    handleScroll,
    doesBrowserSupportPassiveScroll() ? { passive: true } : false,
  )

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value) {
        fetchPosts()
      }
    },
    { threshold: 0.5 },
  )

  if (sentinel.value) {
    intersectionObserver.observe(sentinel.value)
  }

  // TODO: No magic numbers
  setInterval(checkForStaleFeed, 10 * 60 * 1000)
})
</script>
