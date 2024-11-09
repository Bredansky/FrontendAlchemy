// usePostTimestamp.ts
import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'

export function usePostTimestamp(post: AuthoredPostWithHeight) {
  const relativeTimestamp = ref('')

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const postDate = new Date(timestamp)
    const timeDifference = Number(now) - Number(postDate)

    const seconds = Math.floor(timeDifference / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days >= 1) return formatDate(timestamp)
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    if (seconds >= 10) return `${seconds} second${seconds === 1 ? '' : 's'} ago`
    return 'Just now'
  }

  const updateTimestamp = () => {
    relativeTimestamp.value = formatRelativeTime(post.createdAt)
  }

  onMounted(() => {
    updateTimestamp()

    const postDate = new Date(post.createdAt)
    const now = new Date()
    const timeDifference = Number(now) - Number(postDate)

    if (timeDifference < 24 * 60 * 60 * 1000) {
      const interval = setInterval(() => {
        updateTimestamp()
      }, 60000)

      onUnmounted(() => {
        clearInterval(interval)
      })
    }
  })

  return relativeTimestamp
}

function formatDate(timestamp: Date) {
  const userLocale = import.meta.client
    ? navigator.language || navigator.languages[0]
    : 'en-US'
  const date = new Date(timestamp)
  const formattedTime = new Intl.DateTimeFormat(userLocale, {
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).format(date)
  const formattedDate = new Intl.DateTimeFormat(userLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
  return `${formattedTime} · ${formattedDate}`
}
