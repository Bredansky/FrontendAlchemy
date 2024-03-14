import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  nickname: text("first_name").notNull(),
  profilePhotoUrl: text("profile_photo_url").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type SelectUser = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey(),
  authorId: integer("author_id")
    .notNull()
    .references((): AnySQLiteColumn => users.id),
  content: text("content").notNull(),
  image_url: text("image_url"),
  reactions: text("reactions", { mode: "json" })
    .$type<{ likes: number; haha: number }>()
    .default(sql`'{"likes": 0, "haha": 0}'`)
    .notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type SelectPost = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
