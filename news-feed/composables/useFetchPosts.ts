// TODO: Separate types folder or something

import { useUser } from './useUser'
import type { AuthoredPost } from '~/server/api/posts.get'

export function fetchPosts(userId: string) {
  const errorState = useState('errorState', () => '')
  const isDataStale = ref(false) // To track if the feed is stale
  let staleTimeout: ReturnType<typeof setTimeout> | null = null

  const fetchData = async (size: number, nextCursor: string) => {
    try {
      const { user } = await useUser(userId) // Destructure to access user
      if (!user.value) {
        errorState.value = 'Failed to get user for feed'
        return {
          posts: [],
          cursor: '',
        }
      }

      const res = await $fetch<{ posts: AuthoredPost[], pagination: { next_cursor: string | null } }>('/api/posts', {
        query: { size, cursor: nextCursor, userId: user.value.id },
      })

      isDataStale.value = false // Reset the stale flag when posts are fetched
      resetStaleTimer() // Restart the stale timer

      const posts = res.posts
      const cursor = res.pagination.next_cursor

      return { posts, cursor }
    }
    catch (error) {
      console.error('Error fetching posts:', error)
      errorState.value = 'Failed to fetch posts'
      return {
        posts: [],
        cursor: '',
      }
    }
  }

  const resetStaleTimer = () => {
    if (staleTimeout) {
      clearTimeout(staleTimeout) // Clear any existing timeout
    }
    // TODO: No magic numbers
    // Set a new timer to mark feed as stale after 5 minutes (300,000 ms)
    staleTimeout = setTimeout(() => {
      isDataStale.value = false
    }, 300000)
  }

  return { fetchData, isDataStale }
}
