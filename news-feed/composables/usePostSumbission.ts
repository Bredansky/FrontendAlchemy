import { faker } from '@faker-js/faker'
import type { AuthoredPostWithHeight } from '~/features/feed/FeedPost.vue'

export function usePostSubmission(content: Ref<string>, addFancyPicture: Ref<boolean>) {
  const posts = useState<AuthoredPostWithHeight[]>('posts', () => [])
  const viewPortWidth = useState('viewPortWidth', () => 0)

  const postNewPost = async () => {
    const { user } = await useUser('4') // Assuming this is valid and within the right context

    if (!user.value) {
      console.error('User is not defined')
      return // Ensure user is available
    }

    const randomImage = faker.image.urlPicsumPhotos({ width: 320, height: 180 }) + '.webp'

    const dummyPost: AuthoredPostWithHeight = {
      id: parseInt(Math.random().toString().slice(2, 9), 10),
      content: content.value,
      author: { nickname: user.value.nickname, profilePhotoUrl: user.value.profilePhotoUrl },
      imageUrl: addFancyPicture.value ? randomImage : null,
      reactions: { likes: 0, hahas: 0 },
      currentUserReaction: { liked: false, hahaed: false },
      createdAt: new Date(),
      authorId: user.value.id,
      height: 0,
    }

    dummyPost.height = calculatePostHeight(dummyPost, viewPortWidth.value)
    posts.value = [dummyPost, ...posts.value]

    try {
      const { newPost } = await $fetch<{ newPost: { lastInsertRowid: number } }>('api/posts', {
        method: 'POST',
        body: {
          imageUrl: addFancyPicture.value ? randomImage : null,
          content: content.value,
          authorId: user.value.id,
        },
      })

      posts.value = posts.value.map((post) => {
        if (post.id === dummyPost.id) {
          return { ...post, id: newPost.lastInsertRowid }
        }
        return post
      })
    }
    catch (error) {
      posts.value = posts.value.filter(post => post.id !== dummyPost.id)
      console.error('Error posting new post:', error)
    }

    content.value = ''
    navigateTo('/feed')
  }

  return {
    postNewPost,
  }
}
