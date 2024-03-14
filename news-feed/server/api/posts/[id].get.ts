import { posts } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    // get id as function parameter from route params
    const postId = event.context.params?.id as string;
    const postsResp = db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(postId)))
      .get();
    return { post: postsResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
