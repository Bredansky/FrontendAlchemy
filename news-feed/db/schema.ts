import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  nickname: text("nickname").notNull(),
  profilePhotoUrl: text("profile_photo_url").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  authorId: integer("author_id")
    .notNull()
    .references((): AnySQLiteColumn => users.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

export const reactions = sqliteTable("reactions", {
  id: integer("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references((): AnySQLiteColumn => posts.id),
  userId: integer("user_id")
    .notNull()
    .references((): AnySQLiteColumn => users.id),
  type: text("type").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export type SelectReaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;
