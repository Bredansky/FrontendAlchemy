import { faker } from '@faker-js/faker'
import { sql } from 'drizzle-orm'
import { users, type InsertUser, posts, type InsertPost, reactions, type InsertReaction } from './schema'
import { db } from '.'

function createRandomUser(): InsertUser {
  return {
    nickname: faker.person.firstName(),
    profilePhotoUrl: faker.image.avatar(),
  }
}

function createRandomPost(authorId: number): InsertPost {
  return {
    authorId, // Ensure the authorId matches an existing user
    content: faker.lorem.paragraph(),
    imageUrl:
      Math.random() < 0.3
        ? null
        : faker.image.urlPicsumPhotos({ width: 320, height: 180 }) + '.webp',
  }
}

function createRandomReaction(postId: number, userIds: number[]): InsertReaction {
  return {
    postId, // Ensure the postId matches an existing post
    userId: faker.helpers.arrayElement(userIds), // Ensure the userId matches an existing user
    type: faker.helpers.arrayElement(['like', 'haha']),
    createdAt: faker.date.past(),
  }
}

async function main() {
  await db.delete(reactions) // Clean reactions table
  await db.delete(posts) // Clean posts table
  await db.delete(users) // Clean users table

  await db.execute(sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE posts_id_seq RESTART WITH 1`)
  await db.execute(sql`ALTER SEQUENCE reactions_id_seq RESTART WITH 1`)

  const USERS: InsertUser[] = faker.helpers.multiple(createRandomUser, {
    count: 5,
  })
  const insertedUsers = await db.insert(users).values(USERS).returning({ id: users.id })

  const userIds = insertedUsers.map(user => user.id)

  const POSTS: InsertPost[] = faker.helpers.multiple(() => createRandomPost(faker.helpers.arrayElement(userIds)), {
    count: 50,
  })
  const insertedPosts = await db.insert(posts).values(POSTS).returning({ id: posts.id })

  const postIds = insertedPosts.map(post => post.id)

  const REACTIONS: InsertReaction[] = postIds.flatMap((postId) => {
    // Create at least one reaction for each post
    const guaranteedReaction = createRandomReaction(postId, userIds)

    // Optionally add more random reactions for the post
    const additionalReactions = faker.helpers.multiple(() => createRandomReaction(postId, userIds), {
      count: faker.number.int({ min: 0, max: 4 }), // 0 to 4 additional reactions
    })

    return [guaranteedReaction, ...additionalReactions]
  })

  await db.insert(reactions).values(REACTIONS)
}

main().catch((err) => {
  console.error('Seeding failed:', err)
})
