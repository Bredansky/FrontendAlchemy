import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'

export function usePostReactions(post: AuthoredPostWithHeight, userId: string) {
  const userReactions = ref({
    liked: post.currentUserReaction.liked,
    hahaed: post.currentUserReaction.hahaed,
  })

  const postReactions = ref({
    likes: post.reactions.likes,
    hahas: post.reactions.hahas,
  })

  const toggleReaction = async (reactionType: 'liked' | 'hahaed') => {
    try {
      const isActive = userReactions.value[reactionType]
      const action = isActive ? 'unreact' : 'react'

      if (reactionType === 'liked') {
        postReactions.value.likes += isActive ? -1 : 1
        userReactions.value.liked = !isActive
      }
      else if (reactionType === 'hahaed') {
        postReactions.value.hahas += isActive ? -1 : 1
        userReactions.value.hahaed = !isActive
      }

      await $fetch(`/api/posts/${post.id}/react`, {
        method: 'PUT',
        body: JSON.stringify({ action, reactionType, userId }),
      })
    }
    catch (error) {
      console.error(`Error toggling ${reactionType} reaction:`, error)

      // Revert the optimistic update if the API call fails
      if (reactionType === 'liked') {
        postReactions.value.likes += userReactions.value.liked ? -1 : 1
        userReactions.value.liked = !userReactions.value.liked
      }
      else if (reactionType === 'hahaed') {
        postReactions.value.hahas += userReactions.value.hahaed ? -1 : 1
        userReactions.value.hahaed = !userReactions.value.hahaed
      }
    }
  }

  return {
    userReactions,
    postReactions,
    toggleReaction,
  }
}
