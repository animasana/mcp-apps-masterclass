import OAuthProvider from '@cloudflare/workers-oauth-provider';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import { handleAuthorizeGet, handleAuthorizePost } from './lib/authorize';

const WIDGET_URI = 'ui://ecommerce-widget';

const privateHandler = {
	async fetch(request, env, ctx) {
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

		// Tool: Search Products (model only, no UI — data tool for looking up product IDs)
		server.registerTool(
			'search-products',
			{
				title: 'Search Products',
				description:
					'Search products by name or category. Returns product data without showing a widget. Use this to look up product IDs before calling add-to-cart or get-product.',
				inputSchema: {
					query: z.string().optional().describe('Search by product name or description'),
					category: z.string().optional().describe('Filter by category: pizza, protein, produce'),
				},
				annotations: { readOnlyHint: true },
			},
			async ({ query, category }) => {
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
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
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
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
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
				};
			},
		);

		// Tool: Add to Cart (model + app, no UI)
		server.registerTool(
			'add-to-cart',
			{
				title: 'Add to Cart',
				description: 'Add a product to the shopping cart. Use search-products first to find the product ID.',
				inputSchema: {
					productId: z.string().describe('Product ID to add'),
					quantity: z.number().int().default(1).describe('Quantity to add (negative to decrement)'),
				},
				_meta: {
					ui: { visibility: ['model', 'app'] },
				},
			},
			async ({ productId, quantity }) => {
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
				};
			},
		);

		// Tool: Remove from Cart (model + app, no UI)
		server.registerTool(
			'remove-from-cart',
			{
				title: 'Remove from Cart',
				description: 'Remove a product from the shopping cart.',
				inputSchema: {
					productId: z.string().describe('Product ID to remove'),
				},
				_meta: {
					ui: { visibility: ['model', 'app'] },
				},
			},
			async ({ productId }) => {
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
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
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
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
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
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
				return {
					content: [{ type: 'text', text: 'Not implemented' }],
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
