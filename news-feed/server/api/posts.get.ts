import { desc, eq, sql, or, and, exists } from 'drizzle-orm'
import {
  posts,
  users,
  reactions,
  type SelectPost,
  type SelectUser,
} from '@/db/schema'
import { db } from '@/db'

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
        // Couldn't achieve compatible type using drizzle-orm methods
        likes: sql<number>`(SELECT COUNT(*) FROM ${reactions} WHERE ${reactions.postId} = ${posts.id} AND ${reactions.type} = 'like')`, // Count likes for each post
        hahas: sql<number>`(SELECT COUNT(*) FROM ${reactions} WHERE ${reactions.postId} = ${posts.id} AND ${reactions.type} = 'haha')`, // Count hahas for each post
        liked: exists(
          db
            .select()
            .from(reactions)
            .where(
              and(
                eq(reactions.postId, posts.id),
                eq(reactions.userId, validUserId),
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
                eq(reactions.type, 'haha'),
              ),
            ),
        ),
      })
      .from(posts)
      .leftJoin(users, eq(users.id, posts.authorId))
      .orderBy(desc(posts.id), desc(posts.createdAt)) // Using 'id' as a tiebreaker
      .limit(Number(size) + 1) // Fetch one extra to check if there's more data

    if (cursor) {
      const [cursorCreatedAt, cursorId] = cursor.toString().split('_')
      query = query.where(
        or(
          sql`${posts.createdAt} < ${cursorCreatedAt}`,
          sql`${posts.createdAt} = ${cursorCreatedAt} AND ${posts.id} < ${cursorId}`,
        ),
      ) as typeof query
    }

    const results = await query.all()

    const aggregatedResults = results
      .map(({ post, user, likes, hahas, liked, hahaed }) => {
        if (!user) {
          return null
        }

        return {
          ...post,
          author: {
            nickname: user.nickname,
            profilePhotoUrl: user.profilePhotoUrl,
          },
          reactions: {
            likes,
            hahas,
          },
          currentUserReaction: {
            liked: !!liked, // Cast to boolean
            hahaed: !!hahaed, // Cast to boolean
          },
        }
      })
      .filter(post => post !== null)

    let nextCursor = ''

    if (!cursor || results.length > Number(size)) {
      // If we fetched more than requested, there are more results available
      const lastResult = aggregatedResults[aggregatedResults.length - 1]
      const dateObject = lastResult
        ? new Date(lastResult.createdAt)
        : new Date()
      const unixTimestamp = Math.floor(dateObject.getTime() / 1000)

      nextCursor
        = lastResult && lastResult.createdAt && lastResult.id
          ? `${unixTimestamp}_${lastResult.id}` // Constructing next cursor
          : ''
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
