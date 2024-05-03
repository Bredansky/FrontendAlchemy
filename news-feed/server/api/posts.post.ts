import { posts, type InsertPost } from "@/db/schema";
import { db } from "@/db";
import { faker } from "@faker-js/faker";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('aaaaa', body)
    const newPost: InsertPost = {
      ...body,
      ...(body.addFancyPicture && { image_url: faker.image.urlPicsumPhotos() } ) 
    };
    const result = db.insert(posts).values(newPost).run();
    return { newpost: result };
  } catch (e: any) {
    throw createError({
      statusCode: 400,
      statusMessage: e.message,
    });
  }
});
