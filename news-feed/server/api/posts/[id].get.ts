import { eq } from 'drizzle-orm'
import { posts } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    // get id as function parameter from route params
    const postId = event.context.params?.id as string
    const postsResp = db
      .select()
      .from(posts)
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
