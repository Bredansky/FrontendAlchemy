import { eq } from 'drizzle-orm'
import { type InsertPost, posts } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    const postId = event.context.params?.id as string
    const body = await readBody(event)
    const editpost: InsertPost = {
      ...body,
    }
    const postsResp = db
      .update(posts)
      .set(editpost)
      .where(eq(posts.id, parseInt(postId)))
      .run()
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
