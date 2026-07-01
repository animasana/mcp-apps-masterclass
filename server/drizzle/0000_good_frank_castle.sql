CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "qtty_positive_only" CHECK("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`description` text NOT NULL,
	`short_description` text NOT NULL,
	`detail_summary` text NOT NULL,
	`nutrition_facts` text DEFAULT '[]' NOT NULL,
	`highlights` text DEFAULT '[]' NOT NULL,
	`image` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`rating` integer NOT NULL,
	`text` text NOT NULL,
	`file_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	PRIMARY KEY(`product_id`, `user_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "rating_1_5" CHECK("reviews"."rating" BETWEEN 1 AND 5)
);
