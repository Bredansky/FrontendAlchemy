import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id as string
    const usersResp = db
      .delete(users)
      .where(eq(users.id, parseInt(userId)))
      .execute()
    return { user: usersResp }
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
