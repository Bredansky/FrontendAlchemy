import { eq } from 'drizzle-orm'
import { posts } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    const postId = event.context.params?.id as string
    const postsResp = db
      .delete(posts)
      .where(eq(posts.id, parseInt(postId)))
      .execute()
    return { post: postsResp }
  }
  catch (e: unknown) {
    if (e instanceof Error) {
      throw createError({
        statusCode: 400,
        statusMessage: e.message,
      })
    }
    else {
      throw createError({
        statusCode: 400,
        statusMessage: 'An unknown error occurred',
      })
    }
  }
})
