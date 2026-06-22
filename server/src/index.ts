import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import crypto from 'node:crypto';

const WIDGET_URI = 'ui://flashcards-widget';

const cardSchema = z.object({
	id: z.string().readonly(),
	front: z.string().describe('The question or prompt'),
	back: z.string().describe('The answer'),
	hint: z.string().describe('A hint for the card'),
	status: z.enum(['new', 'learning', 'mastered']).readonly().default('new'),
});

const inputCardSchema = cardSchema.omit({ id: true, status: true });

const deckSchema = z.object({
	title: z.string().describe("The title of the deck e.g 'React Fundamentals'"),
	description: z.string().describe('Brief description of what this deck covers.'),
	cards: z.array(inputCardSchema).min(10).max(20).describe('Array of flashcards (aim for 20.)'),
});

const savedDeckSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	cards: z.array(cardSchema),
	createdAt: z.string(),
});

const deckSummarySchema = savedDeckSchema.extend({
	masteredCount: z.number(),
});

const createDeckOutputSchema = z.object({
	deck: savedDeckSchema,
	username: z.string(),
});

const listDecksOutputSchema = z.object({
	decks: z.array(deckSummarySchema),
	username: z.string(),
});

const openDeckOutputSchema = z.object({
	deck: savedDeckSchema,
	username: z.string(),
	deckId: z.string(),
});

const deckUpdateOutputSchema = z.object({
	deck: savedDeckSchema,
});

type Deck = z.infer<typeof savedDeckSchema>;
type Card = z.infer<typeof cardSchema>;

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname !== '/mcp') {
			return env.ASSETS.fetch(request);
		}

		const server = new McpServer({
			name: 'Flashcards2 Server',
			version: '1.0',
		});

		registerAppResource(
			server,
			'Flashcards2 Widget',
			WIDGET_URI,
			{
				description: 'Flashcards2 widget',
			},
			async () => {
				const html = await env.ASSETS.fetch(new URL('http://hello/index.html'));
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
				outputSchema: createDeckOutputSchema,
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
					...card,
					id: `card-${Date.now()}-${index}`,
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
							text: `Created a ${title} deck with ${cards.length} flashcards and ${JSON.stringify(deck)}`,
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
				outputSchema: listDecksOutputSchema,
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
						structuredContent: { decks: [], username },
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
				outputSchema: openDeckOutputSchema,
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
						structuredContent: { deck, username, deckId },
					};
				}

				return {
					content: [
						{
							type: 'text',
							text: `Studying ${deck.title} with ${deck.description} opened. ${JSON.stringify(deck.cards)}`,
						},
					],
					structuredContent: { deck, username, deckId },
					_meta: {
						viewUUID: crypto.randomUUID(),
					},
				};
			},
		);

		// mark card (private)
		registerAppTool(
			server,
			'mark-card',
			{
				title: 'Mark card',
				description: 'This is to change the status of a card.',
				inputSchema: {
					username: z.string(),
					deckId: z.string(),
					status: z.enum(['learning', 'mastered']),
					cardId: z.string(),
				},
				outputSchema: deckUpdateOutputSchema,
				annotations: {
					readOnlyHint: false,
				},
				_meta: {
					ui: {
						visibility: ['app'],
					},
				},
			},
			async ({ username, deckId, cardId, status }) => {
				const deckKey = `user:${username}:deck:${deckId}`;

				const deck = await env.FLASHCARDS_KV.get<Deck>(deckKey, 'json');

				if (!deck) {
					return {
						content: [
							{
								text: 'Error not found',
								type: 'text',
							},
						],
						isError: true,
					};
				}

				const card = deck.cards.find((card) => card.id === cardId);

				if (card) {
					card.status = status;
				}

				await env.FLASHCARDS_KV.put(deckKey, JSON.stringify(deck));

				return {
					content: [
						{
							type: 'text',
							text: `Card ${cardId} has been updated to ${status} status.`,
						},
					],
					structuredContent: { deck },
				};
			},
		);

		// reset deck (private)
		registerAppTool(
			server,
			'reset-deck',
			{
				title: 'Reset Deck',
				description: 'This is to reset the progress of the deck.',
				inputSchema: {
					username: z.string(),
					deckId: z.string(),
				},
				outputSchema: deckUpdateOutputSchema,
				annotations: {
					destructiveHint: true,
				},
				_meta: {
					ui: {
						visibility: ['app'],
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
								text: 'Error not found',
								type: 'text',
							},
						],
						isError: true,
					};
				}
				for (const card of deck.cards) {
					card.status = 'new';
				}

				await env.FLASHCARDS_KV.put(deckKey, JSON.stringify(deck));

				return {
					content: [
						{
							type: 'text',
							text: `Deck progress has been reset`,
						},
					],
					structuredContent: { deck },
				};
			},
		);

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
					destructiveHint: true,
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

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
