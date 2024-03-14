CREATE TABLE `posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`author_id` integer NOT NULL,
	`content` text NOT NULL,
	`image_url` text,
	`reactions` text DEFAULT '{"likes": 0, "haha": 0}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`profile_photo_url` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
