import { posts, reactions } from "@/db/schema";
import { db } from "@/db";
import { eq, and, count } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const postId = event.context.params?.id as string;
    const { action, reactionType, userId } = await readBody(event);

    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(postId)))
      .limit(1);

    if (!post || !post[0]) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found",
      });
    }

    const userReaction = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.postId, parseInt(postId)),
          eq(reactions.userId, userId),
          eq(reactions.type, reactionType)
        )
      )
      .limit(1);

    if (action === "react") {
      if (userReaction.length === 0) {
        await db
          .insert(reactions)
          .values({ postId: parseInt(postId), userId, type: reactionType });
      }
    } else {
      if (userReaction.length > 0) {
        await db.delete(reactions).where(eq(reactions.id, userReaction[0].id));
      }
    }

    // Aggregate the reactions for the post
    const reactionCounts = await db
      .select({ type: reactions.type, count: count() })
      .from(reactions)
      .where(eq(reactions.postId, parseInt(postId)))
      .groupBy(reactions.type);

    const updatedReactions = reactionCounts.reduce(
      (acc: Record<string, number>, { type, count }) => {
        acc[type] = count;
        return acc;
      },
      {}
    );

    return { post: { ...post[0], reactions: updatedReactions } };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
