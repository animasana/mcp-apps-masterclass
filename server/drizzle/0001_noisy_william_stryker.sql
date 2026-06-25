PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`interval_seconds` integer DEFAULT 60 NOT NULL,
	`exercise_count` integer NOT NULL,
	`exercises` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text
);
--> statement-breakpoint
INSERT INTO `__new_workouts`("id", "title", "description", "duration_minutes", "interval_seconds", "exercise_count", "exercises", "user_id", "created_at") SELECT "id", "title", "description", "duration_minutes", "interval_seconds", "exercise_count", "exercises", "user_id", "created_at" FROM `workouts`;--> statement-breakpoint
DROP TABLE `workouts`;--> statement-breakpoint
ALTER TABLE `__new_workouts` RENAME TO `workouts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;