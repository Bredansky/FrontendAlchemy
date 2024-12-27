import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'

export function usePostReactions(post: AuthoredPostWithHeight, userId: string) {
  const userReactions = post.currentUserReaction

  const postReactions = post.reactions

  const toggleReaction = async (reactionType: 'like' | 'haha') => {
    const reactionMap: { [key in 'like' | 'haha']: 'liked' | 'hahaed' } = {
      like: 'liked',
      haha: 'hahaed',
    }
    try {
      const isActive = userReactions[reactionMap[reactionType]]
      const action = isActive ? 'remove' : 'add'

      if (reactionType === 'like') {
        postReactions.likes += isActive ? -1 : 1
        userReactions.liked = !isActive
      }
      else if (reactionType === 'haha') {
        postReactions.hahas += isActive ? -1 : 1
        userReactions.hahaed = !isActive
      }

      await $fetch(`/api/reactions`, {
        method: 'POST',
        body: JSON.stringify({ action, reactionType, userId, postId: post.id }),
      })
    }
    catch (error) {
      console.error(`Error toggling ${reactionType} reaction:`, error)

      if (reactionType === 'like') {
        postReactions.likes += userReactions.liked ? -1 : 1
        userReactions.liked = !userReactions.liked
      }
      else if (reactionType === 'haha') {
        postReactions.hahas += userReactions.hahaed ? -1 : 1
        userReactions.hahaed = !userReactions.hahaed
      }
    }
  }

  return {
    userReactions,
    postReactions,
    toggleReaction,
  }
}
