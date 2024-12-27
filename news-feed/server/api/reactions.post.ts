import { eq, and } from 'drizzle-orm'
import { posts, reactions } from '@/db/schema'
import { db } from '@/db'

export default defineEventHandler(async (event) => {
  try {
    const { action, reactionType, userId, postId } = await readBody(event)

    // Validate input
    if (!action || !reactionType || !userId || !postId) {
      throw new Error('Missing required fields: action, reactionType, userId, or postId')
    }

    if (!['add', 'remove'].includes(action)) {
      throw new Error('Invalid action. Must be "add" or "remove".')
    }

    if (!['like', 'haha'].includes(reactionType)) {
      throw new Error('Invalid action. Must be "like" or "haha".')
    }

    // Ensure the post exists
    const postExists = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (!postExists.length) {
      throw new Error('Post does not exist.')
    }

    if (action === 'add') {
      // Add a reaction
      const existingReaction = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.postId, postId),
            eq(reactions.userId, userId),
            eq(reactions.type, reactionType),
          ),
        )
        .limit(1)

      if (existingReaction.length) {
        throw new Error('Reaction already exists.')
      }

      await db.insert(reactions).values({
        postId,
        userId,
        type: reactionType,
      })

      return { message: 'Reaction added successfully.' }
    }
    else if (action === 'remove') {
      // Remove a reaction
      const deletedCount = await db
        .delete(reactions)
        .where(
          and(
            eq(reactions.postId, postId),
            eq(reactions.userId, userId),
            eq(reactions.type, reactionType),
          ),
        )

      if (!deletedCount) {
        throw new Error('Reaction not found.')
      }

      return { message: 'Reaction removed successfully.' }
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
