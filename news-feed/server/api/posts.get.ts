import { desc, eq, sql, or, and, exists } from 'drizzle-orm'
import {
  posts,
  users,
  reactions,
  type SelectPost,
  type SelectUser,
} from '@/db/schema'
import { db } from '@/db'

// TODO: Move this to a shared file
export interface AuthoredPost extends SelectPost {
  author: Pick<SelectUser, 'nickname' | 'profilePhotoUrl'>
  reactions: {
    likes: number
    hahas: number
  }
  currentUserReaction: {
    liked: boolean
    hahaed: boolean
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { size, cursor, userId } = getQuery(event)

    if (!userId) {
      throw new Error('Invalid userId')
    }

    const validUserId = Array.isArray(userId)
      ? parseInt(userId[0], 10)
      : parseInt(userId.toString(), 10)

    let query = db
      .select({
        post: posts,
        user: users,
        liked: exists(
          db
            .select()
            .from(reactions)
            .where(
              and(
                eq(reactions.postId, posts.id),
                eq(reactions.userId, validUserId),
                // TODO: type 'likes' should be enum
                eq(reactions.type, 'like'),
              ),
            ),
        ),
        hahaed: exists(
          db
            .select()
            .from(reactions)
            .where(
              and(
                eq(reactions.postId, posts.id),
                eq(reactions.userId, validUserId),
                // TODO: type 'hahas' should be enum
                eq(reactions.type, 'haha'),
              ),
            ),
        ),
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.authorId))
      .orderBy(desc(posts.id), desc(posts.createdAt))
      .limit(Number(size) + 1)

    if (cursor) {
      const [cursorCreatedAt, cursorId] = cursor.toString().split('_')

      const cursorDate = (new Date(parseInt(cursorCreatedAt) * 1000)).toISOString()

      query = query.where(
        or(
          sql`${posts.id} < ${cursorId}`, // Prioritize `id` comparison first
          sql`${posts.createdAt} < ${cursorDate} AND ${posts.id} < ${cursorId}`, // Use `createdAt` for tie-breaking if needed
        ),
      ) as typeof query
    }

    const results = await query.execute() // Using execute() instead of all()

    const aggregatedResults = results
      .map(({ post, user, liked, hahaed }) => {
        if (!user) {
          return null
        }
        return {
          ...post,
          author: {
            nickname: user.nickname,
            profilePhotoUrl: user.profilePhotoUrl,
          },
          currentUserReaction: {
            liked: !!liked,
            hahaed: !!hahaed,
          },
        }
      })
      .filter(post => post !== null)

    let nextCursor = null

    if (!cursor || results.length > Number(size)) {
      const lastResult = aggregatedResults[aggregatedResults.length - 1]
      const dateObject = lastResult
        ? new Date(lastResult.createdAt)
        : new Date()
      const unixTimestamp = Math.floor(dateObject.getTime() / 1000)

      nextCursor = lastResult && lastResult.createdAt && lastResult.id
        ? `${unixTimestamp}_${lastResult.id}`
        : null
    }

    return {
      pagination: { size, next_cursor: nextCursor },
      posts: aggregatedResults,
    }
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
