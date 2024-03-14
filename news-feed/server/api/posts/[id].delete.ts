import { posts } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
export default defineEventHandler(async (event) => {
  try {
    const postId = event.context.params?.id as string;
    const postsResp = db
      .delete(posts)
      .where(eq(posts.id, parseInt(postId)))
      .run();
    return { post: postsResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
