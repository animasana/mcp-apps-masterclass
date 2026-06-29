import { sql } from 'drizzle-orm';
import { check, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';

export const products = sqliteTable('products', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text().notNull(),
	price: integer().notNull(),
	description: text().notNull(),
	shortDescription: text('short_description').notNull(),
	detailSummary: text('detail_summary').notNull(),
	nutritionFacts: text('nutrition_facts', { mode: 'json' }).$type<{ label: string; value: string }[]>().notNull().default([]),
	highlights: text({ mode: 'json' }).$type<string[]>().notNull().default([]),
	image: text().notNull(),
	category: text().notNull(),
});

export const cartItems = sqliteTable(
	'cart_items',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id').notNull(),
		productId: text('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		quantity: integer().notNull(),
	},
	(table) => [check('qtty_positive_only', sql`${table.quantity} > 0`)],
);

export const reviews = sqliteTable(
	'reviews',
	{
		userId: text('user_id').notNull(),
		productId: text('product_id')
			.notNull()
			.references(() => products.id, { onDelete: 'cascade' }),
		rating: integer().notNull(),
		text: text().notNull(),
		fileId: text('file_id').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(current_timestamp)`),
	},
	(table) => [check('rating_1_5', sql`${table.rating} BETWEEN 1 AND 5`), primaryKey({ columns: [table.productId, table.userId] })],
);
