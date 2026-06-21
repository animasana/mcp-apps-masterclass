import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';

const WIDGET_URI = 'ui://flashcards-widget';

const cardSchema = z.object({
	front: z.string().describe('The question or prompt'),
	back: z.string().describe('The answer'),
	hint: z.string().describe('A hint for the card'),
	status: z.enum(['new', 'learning', 'mastered']).readonly().default('new'),
});

const deckSchema = z.object({
	title: z.string().describe("The title of the deck e.g 'React Fundamentals'"),
	description: z.string().describe('Brief description of what this deck covers.'),
	cards: z.array(cardSchema).min(10).max(20).describe('Array of flashcards (aim for 20.)'),
});

type Deck = z.infer<typeof deckSchema>;
type Card = z.infer<typeof cardSchema>;

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
					deck: deckSchema,
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
			async ({ deck: { title, description, cards }, username }) => {
				const cardsWithIdss = cards.map((card, index) => ({
					id: `card-${Date.now()}-${index}`,
					...card,
					status: 'new',
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
		registerAppTool(
			server,
			'list-decks',
			{
				title: 'List Decks',
				description:
					"Use this to show the user a list of their decks. Ask the user for their username before using this tool. if you dont't know it.",
				inputSchema: {
					username: z.string().describe("The user's username. Ask for this before using the tool."),
				},
				annotations: {
					readOnlyHint: true,
				},
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
				},
			},
			async ({ username }) => {
				const decksKey = `user:${username}:decks`;

				const deckIds = await env.FLASHCARDS_KV.get<string[]>(decksKey, 'json');

				if (!deckIds || deckIds.length === 0) {
					return {
						content: [
							{
								text: 'You have no decks',
								type: 'text',
							},
						],
						structuredContent: { decks: [] },
					};
				}

				const decks = [];

				for (const deckId of deckIds) {
					const deck = await env.FLASHCARDS_KV.get<Deck>(`user:${username}:deck:${deckId}`, 'json');
					if (deck) {
						const masteredCount = deck.cards.filter((card) => card.status === 'mastered').length;
						decks.push({ masteredCount, ...deck });
					}
				}

				await env.FLASHCARDS_KV.put(decksKey, JSON.stringify(deckIds));

				return {
					content: [
						{
							type: 'text',
							text: `Found a total of ${decks.length} ${JSON.stringify(decks)}`,
						},
					],
					structuredContent: { decks, username },
				};
			},
		);

		// open deck
		registerAppTool(
			server,
			'open-deck',
			{
				title: 'Open Deck',
				description:
					"Use this to open a deck for a user to study. Ask the user for their username before using this tool. if you dont't know it. Make sure you also have the deck id.",
				inputSchema: {
					username: z.string().describe("The user's username. Ask for this before using the tool."),
					deckId: z.string().describe('The ID of the deck. You can get it using the `list-decks` tool'),
				},
				annotations: {
					readOnlyHint: true,
				},
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
					},
				},
			},
			async ({ username, deckId }) => {
				const deckKey = `user:${username}:deck:${deckId}`;

				const deck = await env.FLASHCARDS_KV.get<Deck>(deckKey, 'json');

				if (!deck) {
					return {
						content: [
							{
								text: 'Deck not found',
								type: 'text',
							},
						],
						structuredContent: { decks: [] },
					};
				}

				return {
					content: [
						{
							type: 'text',
							text: `Studying ${deck.title} with ${deck.description} opened. ${deck.cards}`,
						},
					],
					structuredContent: { deck, username },
				};
			},
		);

		// mark card (private)

		// reset deck (private)

		// delete deck
		registerAppTool(
			server,
			'delete-deck',
			{
				title: 'Delete Deck',
				description:
					"Use this to delete a deck. Ask the user for their username before using this tool. if you dont't know it. Make sure you also have the deck id.",
				inputSchema: {
					username: z.string().describe("The user's username. Ask for this before using the tool."),
					deckId: z.string().describe('The ID of the deck to delete. You can get it using the `list-decks` tool'),
				},
				annotations: {
					readOnlyHint: true,
				},
				_meta: {},
			},
			async ({ username, deckId }) => {
				const deckKey = `user:${username}:deck:${deckId}`;

				const deck = await env.FLASHCARDS_KV.get<Deck>(deckKey, 'json');

				if (!deck) {
					return {
						content: [
							{
								text: 'Deck not found',
								type: 'text',
							},
						],
					};
				}
				await env.FLASHCARDS_KV.delete(deckKey);

				return {
					content: [
						{
							type: 'text',
							text: `Deck deleted`,
						},
					],
				};
			},
		);

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
