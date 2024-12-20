import { createError, defineEventHandler } from 'h3'
import { posts, type InsertPost } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<InsertPost>(event)
    if ((!body.content || body.content.trim() === '') && !body.imageUrl) {
      throw new Error('Post must have either content or an image.')
    }
    const result = db.insert(posts).values(body).execute()
    return { newPost: result }
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
        statusCode: 500,
        statusMessage: 'An unexpected error occurred.',
      })
    }
  }
})
