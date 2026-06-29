import { drizzle } from 'drizzle-orm/d1';
import { products } from './schema';

const SEED_PRODUCTS = [
	{
		id: 'marys-chicken',
		name: "Mary's Chicken",
		price: 19,
		description:
			'Tender organic chicken breasts trimmed for easy cooking. Raised without antibiotics and air chilled for exceptional flavor.',
		shortDescription: 'Organic chicken breasts',
		detailSummary: '4 lbs • $3.99/lb',
		nutritionFacts: [
			{ label: 'Protein', value: '8g' },
			{ label: 'Fat', value: '9g' },
			{ label: 'Sugar', value: '12g' },
			{ label: 'Calories', value: '160' },
		],
		highlights: [
			'No antibiotics or added hormones.',
			'Air chilled and never frozen for peak flavor.',
			'Raised in the USA on a vegetarian diet.',
		],
		image: 'https://persistent.oaistatic.com/pizzaz-cart-xl/chicken.png',
		category: 'protein',
	},
	{
		id: 'avocados',
		name: 'Avocados',
		price: 1,
		description: 'Creamy Hass avocados picked at peak ripeness. Ideal for smashing into guacamole or topping tacos.',
		shortDescription: 'Creamy Hass avocados',
		detailSummary: '3 ct • $1.00/ea',
		nutritionFacts: [
			{ label: 'Fiber', value: '7g' },
			{ label: 'Fat', value: '15g' },
			{ label: 'Potassium', value: '485mg' },
			{ label: 'Calories', value: '160' },
		],
		highlights: ['Perfectly ripe and ready for slicing.', 'Rich in healthy fats and naturally creamy.'],
		image: 'https://persistent.oaistatic.com/pizzaz-cart-xl/avocado.png',
		category: 'produce',
	},
	{
		id: 'hojicha-pizza',
		name: 'Hojicha Pizza',
		price: 15,
		description:
			'Wood-fired crust layered with smoky hojicha tea sauce and melted mozzarella with a drizzle of honey for an adventurous slice.',
		shortDescription: 'Smoky hojicha sauce & honey',
		detailSummary: '12" pie • Serves 2',
		nutritionFacts: [
			{ label: 'Protein', value: '14g' },
			{ label: 'Fat', value: '18g' },
			{ label: 'Sugar', value: '9g' },
			{ label: 'Calories', value: '320' },
		],
		highlights: ['Smoky roasted hojicha glaze with honey drizzle.', 'Stone-fired crust with a delicate char.'],
		image: 'https://persistent.oaistatic.com/pizzaz-cart-xl/hojicha-pizza.png',
		category: 'pizza',
	},
	{
		id: 'chicken-pizza',
		name: 'Chicken Pizza',
		price: 7,
		description: 'Classic thin-crust pizza topped with roasted chicken, caramelized onions, and herb pesto.',
		shortDescription: 'Roasted chicken & pesto',
		detailSummary: '10" personal • Serves 1',
		nutritionFacts: [
			{ label: 'Protein', value: '20g' },
			{ label: 'Fat', value: '11g' },
			{ label: 'Carbs', value: '36g' },
			{ label: 'Calories', value: '290' },
		],
		highlights: ['Roasted chicken with caramelized onions.', 'Fresh basil pesto and mozzarella.'],
		image: 'https://persistent.oaistatic.com/pizzaz-cart-xl/chicken-pizza.png',
		category: 'pizza',
	},
	{
		id: 'matcha-pizza',
		name: 'Matcha Pizza',
		price: 5,
		description: 'Crisp dough spread with velvety matcha cream and mascarpone. Earthy green tea notes balance gentle sweetness.',
		shortDescription: 'Velvety matcha cream',
		detailSummary: '8" dessert • Serves 2',
		nutritionFacts: [
			{ label: 'Protein', value: '6g' },
			{ label: 'Fat', value: '10g' },
			{ label: 'Sugar', value: '14g' },
			{ label: 'Calories', value: '240' },
		],
		highlights: ['Stone-baked crust with delicate crunch.', 'Matcha mascarpone with white chocolate drizzle.'],
		image: 'https://persistent.oaistatic.com/pizzaz-cart-xl/matcha-pizza.png',
		category: 'pizza',
	},
	{
		id: 'pesto-pizza',
		name: 'Pesto Pizza',
		price: 12,
		description:
			'Hand-tossed crust brushed with bright basil pesto, layered with fresh mozzarella, and finished with roasted cherry tomatoes.',
		shortDescription: 'Basil pesto & tomatoes',
		detailSummary: '12" pie • Serves 2',
		nutritionFacts: [
			{ label: 'Protein', value: '16g' },
			{ label: 'Fat', value: '14g' },
			{ label: 'Carbs', value: '28g' },
			{ label: 'Calories', value: '310' },
		],
		highlights: ['House-made pesto with sweet basil and pine nuts.', 'Roasted cherry tomatoes for a pop of acidity.'],
		image: 'https://persistent.oaistatic.com/pizzaz-cart-xl/matcha-pizza.png',
		category: 'pizza',
	},
];

export async function seedProducts(d1: D1Database) {
	const db = drizzle(d1);
	await db.insert(products).values(SEED_PRODUCTS).onConflictDoNothing();
}
