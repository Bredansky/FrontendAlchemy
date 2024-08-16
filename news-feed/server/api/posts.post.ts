import { posts, type InsertPost } from "@/db/schema";
import { db } from "@/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const result = db.insert(posts).values(body).run();
    return { newpost: result };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
