import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'
import type { AuthoredPost } from '~/server/api/posts.get'

// TODO: reuse this fcking type
interface FetchDataResponse {
  posts: AuthoredPost[]
  cursor: string | null
}

export function useVirtualizedList({
  fetchData,
  minimalPostHeight,
  bufferAmountOfPosts,
  sentinel,
  root,
  viewport,
}: {
  fetchData: (postsToFetch: number, lastCursor: string) => Promise<FetchDataResponse>
  minimalPostHeight: number
  bufferAmountOfPosts: number
  sentinel: Ref<HTMLElement | null>
  viewport: Ref<HTMLElement | null>
  root: Ref<HTMLElement | null>
}) {
  // State management
  const posts = useState<AuthoredPostWithHeight[]>('posts', () => [])
  const cursor = useState<string>('cursor', () => '')
  const loading = ref(false)
  const errorState = ref('')
  const rootHeight = ref(0)
  const viewPortWidth = useState('viewPortWidth', () => 0)
  const scrollTop = useState('scrollTop', () => 0)

  let intersectionObserver: IntersectionObserver | null = null

  // Dynamic post height calculations
  const updatePostsHeight = () => {
    posts.value = posts.value.map(post => ({
      ...post,
      height: calculatePostHeight(post, viewPortWidth.value),
    }))
  }

  // Post fetching logic
  const fetchPosts = async (lastCursor = '') => {
    loading.value = true
    errorState.value = ''

    try {
      const postsToFetch = Math.ceil(rootHeight.value / minimalPostHeight) + bufferAmountOfPosts
      const data = await fetchData(postsToFetch, lastCursor)

      posts.value = [
        ...posts.value,
        ...data.posts.map(post => ({
          ...post,
          height: calculatePostHeight(post, viewPortWidth.value),
          reactions: {
            likes: 0,
            hahas: 0,
          },
        })),
      ]

      cursor.value = data.cursor || ''
      loading.value = false

      // Remove observer if no more data
      if (data.cursor === null && intersectionObserver && sentinel.value) {
        intersectionObserver.unobserve(sentinel.value)
      }
    }
    catch (error) {
      errorState.value = 'Failed to load posts. Please try again.'
      console.error('Error fetching posts:', error)
    }
    finally {
      loading.value = false
    }
  }

  const offsetY = computed(() => {
    // Sum the height of all items before the start index
    return posts.value.slice(0, startIndex.value).reduce((acc, item) => {
      return acc + (item.height || 0) // Ensure height defaults to 0 if undefined
    }, 0)
  })

  // Handle scroll and calculate visible posts
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

  const visibleItems = computed(() => {
    return posts.value.slice(
      startIndex.value,
      startIndex.value + visibleNodeCount.value,
    )
  })

  // IntersectionObserver for dynamic loading
  const setupIntersectionObserver = () => {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading.value) {
        fetchPosts(cursor.value)
      }
    }, { threshold: 0.5 })

    if (sentinel.value) {
      intersectionObserver.observe(sentinel.value)
    }
  }

  // Cleanup observer on component unmount
  const removeObserver = () => {
    if (intersectionObserver && sentinel.value) {
      intersectionObserver.unobserve(sentinel.value)
    }
  }

  // Recalculate dimensions on window resize
  const handleResize = () => {
    viewPortWidth.value = viewport.value?.offsetWidth || 0
    updateRootHeight()
    updatePostsHeight()
  }

  const handlePostResize = (postId: number) => {
    posts.value = posts.value.map((post) => {
      if (post.id === postId) {
        post.height = calculatePostHeight(post, viewPortWidth.value)
      }
      return post
    })
  }

  const refreshPosts = async () => {
    posts.value = []
    cursor.value = ''
    root.value?.scrollTo(0, 0)

    window.scrollTo(0, 0)
    await fetchPosts()
  }

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

    // 167 height of posting card
    // 41 height of header
    // 768 is a mobile width breakpoint

    rootHeight.value = vh - ((root.value?.offsetWidth || 0) < 768 ? 41 : 41 + 167)
  }

  const viewportHeight = computed(() => {
    if (posts.value.length === 0) {
      return 0
    }
    return posts.value.reduce((acc, cur) => {
      return acc + cur.height
    }, 0)
  })

  onMounted(() => {
    viewPortWidth.value = viewport.value?.offsetWidth || 0
    updateRootHeight()
    window.addEventListener('resize', handleResize)
    setupIntersectionObserver()
    fetchPosts() // Initial fetch

    if (root?.value) {
      root.value.scrollTop = scrollTop.value
    }

    root.value?.addEventListener(
      'scroll',
      handleScroll,
      { passive: true },
    )
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
    removeObserver()
  })

  return {
    visibleItems,
    loading,
    handlePostResize,
    refreshPosts,
    offsetY,
    rootHeight,
    viewportHeight,
  }
}
