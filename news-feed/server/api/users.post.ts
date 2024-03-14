import { users, type InsertUser } from "@/db/schema";
import { db } from "@/db";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const newUser: InsertUser = {
      ...body,
    };
    const result = db.insert(users).values(newUser).run();
    return { newUser: result };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
