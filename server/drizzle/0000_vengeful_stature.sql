CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`interval_seconds` integer DEFAULT 60 NOT NULL,
	`exercise_count` integer NOT NULL,
	`exercises` text,
	`user_id` text NOT NULL,
	`created_at` text
);
