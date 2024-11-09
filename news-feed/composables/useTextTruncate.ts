import { ref, computed } from 'vue'
import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'

export function useTextTruncate(
  post: AuthoredPostWithHeight,
  maxChars: number = 300,
  onToggle: () => void,
) {
  const isExpanded = ref(false)
  const postHeight = ref(post.height + 'px')

  const shouldTruncate = computed(() => post.content.length > maxChars)

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    postHeight.value = isExpanded.value ? 'unset' : `${maxChars}px`
    onToggle()
  }

  const displayContent = computed(() => {
    if (isExpanded.value || !shouldTruncate.value) {
      return enrichContent(post.content)
    }
    return enrichContent(post.content.substring(0, maxChars).trim() + '...')
  })

  return {
    isExpanded,
    shouldTruncate,
    toggleExpand,
    displayContent,
    postHeight,
  }
}
