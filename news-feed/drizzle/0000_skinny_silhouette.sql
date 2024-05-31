CREATE TABLE `posts` (
	`id` integer PRIMARY KEY NOT NULL,
	`author_id` integer NOT NULL,
	`content` text NOT NULL,
	`image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` integer PRIMARY KEY NOT NULL,
	`post_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`profile_photo_url` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
