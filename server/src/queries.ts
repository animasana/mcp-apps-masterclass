import { drizzle } from 'drizzle-orm/d1';
import { eq, and, or, like } from 'drizzle-orm';
import { cartItems, products, reviews } from './schema';

function getDb(d1: D1Database) {
	return drizzle(d1);
}

export async function searchProducts(d1: D1Database, query?: string, category?: string) {
	const db = getDb(d1);
	const conditions = [];

	if (query) {
		const q = `%${query}%`;
		conditions.push(or(like(products.name, q), like(products.description, q)));
	}
	if (category) {
		conditions.push(eq(products.category, category));
	}

	return db
		.select()
		.from(products)
		.where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getProductById(d1: D1Database, productId: string) {
	const db = getDb(d1);
	return db.select().from(products).where(eq(products.id, productId)).get();
}

export async function getReviewsByProductId(d1: D1Database, productId: string) {
	const db = getDb(d1);
	return db.select().from(reviews).where(eq(reviews.productId, productId));
}

export async function modifyCart(d1: D1Database, userId: string, productId: string, quantity: number) {
	const db = getDb(d1);

	const existing = await db
		.select()
		.from(cartItems)
		.where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
		.get();

	if (existing) {
		const newQtty = existing.quantity + quantity;
		if (newQtty <= 0) {
			await db.delete(cartItems).where(eq(cartItems.id, existing.id));
		} else {
			await db.update(cartItems).set({ quantity: newQtty }).where(eq(cartItems.id, existing.id));
		}
	} else {
		await db.insert(cartItems).values({
			userId,
			productId,
			quantity,
		});
	}
}

export async function getCartProducts(d1: D1Database, userId: string) {
	const db = await getDb(d1);

	return db
		.select({
			id: products.id,
			name: products.name,
			price: products.price,
			image: products.image,
			quantity: cartItems.quantity,
		})
		.from(cartItems)
		.innerJoin(products, eq(cartItems.id, products.id))
		.where(eq(cartItems.userId, userId));
}

export async function clearCart(d1: D1Database, userId: string) {
	const db = getDb(d1);

	await db.delete(cartItems).where(eq(cartItems.userId, userId));
}
