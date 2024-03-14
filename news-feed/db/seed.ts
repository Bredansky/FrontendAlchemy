import { db } from ".";
import { faker } from "@faker-js/faker";
import { users, type InsertUser, posts, type InsertPost } from "./schema";

export function createRandomUser(): InsertUser {
  return {
    nickname: faker.person.firstName(),
    profilePhotoUrl: faker.image.avatar(),
  };
}

export const USERS: InsertUser[] = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

export function createRandomPosts(): InsertPost {
  return {
    authorId: faker.number.int({ min: 1, max: USERS.length }), // Assuming user IDs start from 1
    content: faker.lorem.paragraph(),
    image_url: Math.random() < 0.3 ? null : faker.image.urlPicsumPhotos(),
    reactions: { likes: 0, haha: 0 }, // Initial reactions
  };
}

export const POSTS: InsertPost[] = faker.helpers.multiple(createRandomPosts, {
  count: 50,
});

async function main() {
  await db.insert(users).values(USERS);
  await db.insert(posts).values(POSTS);
}

main();
