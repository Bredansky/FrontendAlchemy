import { type InsertPost, type InsertUser, posts, users } from "@/db/schema";
import { db } from "@/db";
import { desc, eq, sql } from "drizzle-orm";

// Define an aggregation function
function aggregatePostsAndUsers(
  postsAndUsers: { posts: InsertPost; users: InsertUser }[],
) {
  return postsAndUsers.map(({ posts, users }) => {
    return {
      id: posts.id,
      author: {
        nickname: users.nickname,
        profilePhotoUrl: users.profilePhotoUrl,
      },
      content: posts.content,
      image: posts.image_url,
      reactions: posts.reactions,
      createdAt: posts.createdAt
    };
  });
}

export default defineEventHandler(async (event) => {
  try {
    const { size, cursor } = getQuery(event);

    let query = db
      .select()
      .from(posts)
      .innerJoin(users, eq(users.id, posts.authorId))
      .orderBy(desc(posts.createdAt)) // Assuming 'id' is the primary key
      .limit(Number(size) + 1); // Fetch one extra to check if there's more data

    if (cursor) {
      query = query.where(sql`${posts.id} > ${cursor}`) as typeof query;
    }

    const results = await query.all();
    const aggregatedResult = aggregatePostsAndUsers(results);

    let nextCursor = null;

    if (results.length > Number(size)) {
      // If we fetched more than requested, there are more results available
      const lastResult = aggregatedResult.pop();
      nextCursor =
      lastResult && lastResult.createdAt
      ? lastResult.createdAt.toString()
      : null; // Assuming 'createdAt' is the cursor
    }

    return {
      pagination: { size, next_cursor: nextCursor },
      posts: aggregatedResult,
    };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
