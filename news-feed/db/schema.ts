import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(), // Use serial for auto-incrementing primary keys
  nickname: text('nickname').notNull(),
  profilePhotoUrl: text('profile_photo_url').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(), // Use timestamp and defaultNow() for the createdAt field
})

export type SelectUser = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // Adding onDelete cascade for referential integrity
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(), // Same as above, use timestamp with defaultNow()
})

export type SelectPost = typeof posts.$inferSelect
export type InsertPost = typeof posts.$inferInsert

export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }), // onDelete cascade for referential integrity
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // onDelete cascade for referential integrity
  type: text('type').notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(), // Use timestamp with defaultNow()
})

export type SelectReaction = typeof reactions.$inferSelect
export type InsertReaction = typeof reactions.$inferInsert
