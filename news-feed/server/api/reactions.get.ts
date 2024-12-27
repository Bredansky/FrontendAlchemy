import { inArray } from 'drizzle-orm'
import { reactions } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    const { ids } = getQuery(event)

    const postIds = (ids as string)?.split(',').map(Number)

    if (!postIds || postIds.some(isNaN)) {
      throw new Error('Invalid post IDs')
    }

    const reactionsArray = await db
      .select()
      .from(reactions)
      .where(inArray(reactions.postId, postIds))

    const groupedReactions = reactionsArray.reduce((acc: { [key: number]: { postId: number, reactions: { [key: string]: number } } }, reaction) => {
      const { postId, type } = reaction

      if (!acc[postId]) {
        acc[postId] = { postId, reactions: {} }
      }

      if (!acc[postId].reactions[type]) {
        acc[postId].reactions[type] = 0
      }

      acc[postId].reactions[type] += 1

      return acc
    }, {})

    return { reactions: Object.values(groupedReactions) }
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
