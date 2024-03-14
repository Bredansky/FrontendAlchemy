import { type InsertUser, users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id as string;
    const body = await readBody(event);
    const editUser: InsertUser = {
      ...body,
    };
    const usersResp = db
      .update(users)
      .set(editUser)
      .where(eq(users.id, parseInt(userId)))
      .run();
    return { user: usersResp };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
