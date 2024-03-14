import { users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
export default defineEventHandler(async (event) => {
  try {
    // get id as function parameter from route params
    const userId = event.context.params?.id as string;
    const usersResp = db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .get();
    return { user: usersResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
