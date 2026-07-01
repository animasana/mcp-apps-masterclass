import OAuthProvider from '@cloudflare/workers-oauth-provider';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import { handleAuthorizeGet, handleAuthorizePost } from './lib/authorize';
import { and, eq, like, or } from 'drizzle-orm';
import { cartItems, products, reviews } from './schema';
import { drizzle } from 'drizzle-orm/d1';
import { clearCart, getCartProducts, getProductById, getReviewsByProductId, modifyCart, searchProducts, upsertReview } from './queries';
import { seedProducts } from './seed';

const WIDGET_URI = 'ui://ecommerce-widget';

type AuthProps = {
	email: string;
};

const privateHandler = {
	async fetch(request, env, ctx) {
		const props = ctx.props as AuthProps;
		const server = new McpServer({
			name: 'Ecommerce App',
			version: '1.0',
		});

		registerAppResource(server, 'Ecommerce Widget', WIDGET_URI, { description: 'Ecommerce Widget' }, async () => {
			const html = await env.ASSETS.fetch(new URL('http://hello/index.html'));
			return {
				contents: [
					{
						uri: WIDGET_URI,
						text: await html.text(),
						mimeType: RESOURCE_MIME_TYPE,
						_meta: {
							'openai/widgetPrefersBorder': true,
							ui: {
								csp: {
									connectDomains: ['https://*.workers.dev'],
									resourceDomains: [
										'https://*.workers.dev',
										'https://fonts.googleapis.com',
										'https://fonts.gstatic.com',
										'https://*.oaistatic.com',
									],
								},
							},
						},
					},
				],
			};
		});

		// Tool: Who am i?
		server.registerTool(
			'whoami',
			{
				title: 'whoami',
				description: 'tell the user who they are logged in as.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
			},
			async () => {
				return {
					content: [{ type: 'text', text: `You are logged in as ${JSON.stringify(props)}` }],
				};
			},
		);

		// Tool: Search Products (model only, no UI — data tool for looking up product IDs)
		server.registerTool(
			'search-products',
			{
				title: 'Search Products',
				description:
					'Search products by name or category. Returns product data without showing a widget. Use this to look up product IDs before calling add-to-cart or get-product.',
				inputSchema: {
					query: z.string().toLowerCase().optional().describe('Search by product name or description'),
					category: z.string().optional().describe('Filter by category: pizza, protein, produce'),
				},
				annotations: { readOnlyHint: true },
			},
			async ({ query, category }) => {
				const data = await searchProducts(env.DB, query, category);

				return {
					content: [{ type: 'text', text: JSON.stringify(data.map((p) => ({ id: p.id, name: p.name }))) }],
				};
			},
		);

		// Tool: Get Products (model + app, with UI — shows product grid widget)
		registerAppTool(
			server,
			'get-products',
			{
				title: 'Get Products',
				description:
					"Display products in the widget. Use query to filter by name (e.g. 'pizza') or category to filter by category (e.g. 'pizza', 'protein', 'produce'). Omit both to show all products.",
				inputSchema: {
					query: z.string().optional().describe('Search by product name or description'),
					category: z.string().optional().describe('Filter by category: pizza, protein, produce'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ query, category }) => {
				const data = await searchProducts(env.DB, query, category);

				return {
					content: [{ type: 'text', text: `Found ${data.length} products. ${JSON.stringify(data)}` }],
					structuredContent: { products: data },
				};
			},
		);

		// Tool: Get Product Details (model, with UI — shows single product)
		registerAppTool(
			server,
			'get-product',
			{
				title: 'Get Product Details',
				description:
					"Display a single product's full details in the widget. Always call this when the user asks about a specific product. Use search-products first to find the product ID.",
				inputSchema: {
					productId: z.string().describe('Product ID to display'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ productId }) => {
				const product = await getProductById(env.DB, productId);
				if (!product) {
					return {
						content: [{ type: 'text', text: 'Product not found!' }],
						isError: true,
					};
				}
				const productReviews = await getReviewsByProductId(env.DB, productId);

				return {
					content: [{ type: 'text', text: `Product Details: ${JSON.stringify(products)} showing ${productReviews.length}` }],
					structuredContent: { product, reviews: productReviews },
				};
			},
		);

		// Tool: Modify Cart (model + app, no UI)
		server.registerTool(
			'modify-cart',
			{
				title: 'Modify Cart',
				description: 'Add or Remove a product to the shopping cart. Use search-products first to find the product ID.',
				inputSchema: {
					productId: z.string().describe('Product ID to add'),
					quantity: z.number().int().default(1).describe('Quantity to add (negative to decrement)'),
				},
				_meta: {
					ui: { visibility: ['model', 'app'] },
				},
			},
			async ({ productId, quantity }) => {
				await modifyCart(env.DB, props.email, productId, quantity);
				const cartProducts = await getCartProducts(env.DB, props.email);
				return {
					content: [{ type: 'text', text: `Added ${quantity} item(s) to cart. Cart is now ${cartProducts}.` }],
					structuredContent: { cartItems: cartProducts },
				};
			},
		);

		// Tool: View Cart (model + app, with UI — shows cart widget)
		registerAppTool(
			server,
			'view-cart',
			{
				title: 'View Cart',
				description: 'View current shopping cart contents',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
						visibility: ['model', 'app'],
					},
				},
			},
			async () => {
				const cartProducts = await getCartProducts(env.DB, props.email);
				const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
				return {
					content: [{ type: 'text', text: `Cart has items ${cartProducts} a total of: ${subtotal}` }],
					structuredContent: { cartItems: cartProducts, subtotal },
				};
			},
		);

		// Tool: Checkout (app only, no UI)
		server.registerTool(
			'checkout',
			{
				title: 'Checkout',
				description: 'Complete checkout and create an order from current cart',
				inputSchema: {},
				_meta: {
					ui: { visibility: ['app'] },
				},
			},
			async () => {
				const cartProducts = await getCartProducts(env.DB, props.email);
				if (cartProducts.length === 0) {
					return {
						content: [{ type: 'text', text: `Cart is empty` }],
						isError: true,
					};
				}
				const total = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
				await clearCart(env.DB, props.email);

				return {
					content: [{ type: 'text', text: `Order Placed. Total ${total}` }],
					structuredContent: {
						orderId: crypto.randomUUID(),
						total,
						cartItems: cartProducts,
					},
				};
			},
		);

		// Tool: Submit Review (app only, no UI)
		server.registerTool(
			'submit-review',
			{
				title: 'Submit Review',
				description: 'Submit or update a product review with rating, text, and optional image',
				inputSchema: {
					productId: z.string().describe('Product ID to review'),
					rating: z.number().int().min(1).max(5).describe('Rating from 1 to 5'),
					text: z.string().describe('Review text'),
					imageUrl: z.string().nullable().optional().describe('Temporary download URL of uploaded review image'),
				},
				_meta: {
					ui: { visibility: ['app'] },
				},
			},
			async ({ productId, rating, text, imageUrl }) => {
				let imageKey: string | undefined;
				if (imageUrl) {
					const { ok, body, headers } = await fetch(imageUrl);
					if (ok) {
						const result = await env.BUCKET.put(`ecommerce/${crypto.randomUUID()}`, body, {
							httpMetadata: {
								contentType: headers.get('content-type') || 'image/jpeg',
							},
						});
						imageKey = result.key;
					}
				}

				await upsertReview(env.DB, props.email, productId, rating, text, imageKey);

				const freshReviews = await getReviewsByProductId(env.DB, productId);

				return {
					content: [{ type: 'text', text: `Review submitted. Total reviews ${freshReviews.length}` }],
					structuredContent: {
						reviews: freshReviews,
					},
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

const publicHandler = {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === '/seed') {
			await seedProducts(env.DB);
			return new Response('Seeded products successfully', { status: 200 });
		}

		if (url.pathname === '/authorize') {
			if (request.method === 'GET') {
				return handleAuthorizeGet(request, env);
			}
			if (request.method === 'POST') {
				return handleAuthorizePost(request, env);
			}
		}
		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;

export default new OAuthProvider({
	defaultHandler: publicHandler,
	apiHandler: privateHandler,
	apiRoute: ['/mcp'],
	authorizeEndpoint: '/authorize',
	clientRegistrationEndpoint: '/register',
	tokenEndpoint: '/token',
});
