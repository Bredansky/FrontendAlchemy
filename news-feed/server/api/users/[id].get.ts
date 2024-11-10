import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    // get id as function parameter from route params
    const userId = event.context.params?.id as string
    const usersResp = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))

    return { user: usersResp[0] }
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
