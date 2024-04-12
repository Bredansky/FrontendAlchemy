import { type InsertPost, type InsertUser, posts, users } from "@/db/schema";
import { db } from "@/db";
import { desc, eq, sql, or } from "drizzle-orm";

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
      .orderBy(desc(posts.createdAt), desc(posts.id)) // Using 'id' as a tiebreaker
      .limit(Number(size) + 1); // Fetch one extra to check if there's more data

    if (cursor) {
      const [cursorCreatedAt, cursorId] = cursor.toString().split('_');
      query = query
        .where(
        or(
          sql`${posts.createdAt} < ${cursorCreatedAt}`,
          sql`${posts.createdAt} = ${cursorCreatedAt} AND ${posts.id} < ${cursorId}`,
        )) as typeof query;
        // Maybe assertsion can be fixed like this https://github.com/drizzle-team/drizzle-orm/issues/1437
    }

    const results = await query.all();

    const aggregatedResult = aggregatePostsAndUsers(results);

    let nextCursor = null;

    if (results.length > Number(size)) {
      // If we fetched more than requested, there are more results available
      const lastResult = aggregatedResult[aggregatedResult.length-1];
      console.log('lastResult', lastResult)
      nextCursor =
        lastResult && lastResult.createdAt && lastResult.id
          ? `${lastResult.createdAt}_${lastResult.id}` // Constructing next cursor
          : null;
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
