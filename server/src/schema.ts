import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';
import { Exercise } from '.';

export const workouts = sqliteTable('workouts', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text().notNull(),
	description: text().notNull(),
	durationMinutes: integer('duration_minutes').notNull(),
	intervalSeconds: integer('interval_seconds').notNull().default(60),
	exerciseCount: integer('exercise_count').notNull(),
	exercises: text('exercises', { mode: 'json' }).$type<Exercise[]>().notNull(),
	userId: text('user_id').notNull(),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
