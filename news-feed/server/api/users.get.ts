import { users } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async () => {
  try {
    const usersResp = db.select().from(users).execute()
    return { users: usersResp }
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
