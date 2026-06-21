import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';

const WIDGET_URI = 'ui://flashcards-widget';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Flashcards Server',
			version: '1.0',
		});

		await env.FLASHCARDS_KV.put('Hello', ', World!');

		// create deck
		registerAppTool(
			server,
			'create-deck',
			{
				title: 'Create Deck',
				description:
					'Use this to create a deck of flashcards for studying. Generate 20 cards, with front (question) and back (answer) with a hint as well. Ask the user for their username before using this tool.',
				inputSchema: {
					username: z.string().describe("The user's username. Ask for this before using the tool."),
					title: z.string().describe("The title of the deck e.g 'React Fundamentals'"),
					description: z.string().describe('Brief description of what this deck covers.'),
					cards: z
						.array(
							z.object({
								front: z.string().describe('The question or prompt'),
								back: z.string().describe('The answer'),
								hint: z.string().describe('A hint for the card'),
							}),
						)
						.min(10)
						.max(20)
						.describe('Array of flashcards (aim for 20.)'),
				},
				annotations: {
					readOnlyHint: false,
				},
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
				},
			},
			async ({ title, description, cards, username }) => {
				const cardsWithIdss = cards.map((card, index) => ({
					id: `card-${Date.now()}-${index}`,
					status: 'new',
					...card,
				}));

				const deck = {
					id: `deck-${Date.now()}`,
					title,
					description,
					cards: cardsWithIdss,
					createdAt: new Date().toDateString(),
				};

				const decksKey = `user:${username}:decks`;

				await env.FLASHCARDS_KV.put(`user:${username}:deck:${deck.id}`, JSON.stringify(deck));

				const existingIds = await env.FLASHCARDS_KV.get<string[]>(decksKey, 'json');

				const deckIds = existingIds || [];

				deckIds.push(deck.id);

				await env.FLASHCARDS_KV.put(decksKey, JSON.stringify(deckIds));

				return {
					content: [
						{
							type: 'text',
							text: `Created a ${title} deck with ${cards.length} flashcards`,
						},
					],
					structuredContent: { deck, username },
				};
			},
		);

		// list decks

		// open deck

		// mark card (private)

		// reset deck (private)

		// delete deck

		registerAppResource(
			server,
			'Flashcards Widget',
			WIDGET_URI,
			{
				description: 'Flashcards widget',
			},
			async () => {
				const html = await env.ASSETS.fetch(new URL('http://your-sexy-worker.com/index.html'));

				return {
					contents: [
						{
							uri: WIDGET_URI,
							text: await html.text(),
							mimeType: RESOURCE_MIME_TYPE,
							_meta: {
								ui: {
									csp: {
										connectDomains: ['https://*.workers.dev'],
										resourceDomains: [
											'https://*.workers.dev',
											'https://fonts.googleapis.com',
											'https://fonts.gstatic.com',
											'https://image.tmdb.org',
										],
									},
								},
							},
						},
					],
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
