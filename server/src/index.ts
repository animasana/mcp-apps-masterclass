import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import crypto from 'node:crypto';
import { drizzle } from 'drizzle-orm/d1';
import { workouts } from './schema';
import { eq } from 'drizzle-orm';

const WIDGET_URI = 'ui://workouts-widget';

const exerciseSchema = z.object({
	name: z.string().describe("Exercise name (e.g., 'Push-ups')"),
	reps: z.number().min(1).describe('Number of reps to complete each round'),
	instructions: z.string().describe('Brief form instructions'),
	searchKeyword: z.string().optional().describe("YouTube search keyword for form tutorial (e.g., 'push ups proper form')"),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export default {
	async fetch(request, env, ctx) {
		const server = new McpServer({
			name: 'EMOM Workout Server',
			version: '1.0',
		});

		registerAppResource(
			server,
			'Workout Widget',
			WIDGET_URI,
			{
				description: 'Workout widget',
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
										resourceDomains: ['https://*.workers.dev', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
									},
								},
							},
						},
					],
				};
			},
		);

		// Tool 1: Create a new workout
		registerAppTool(
			server,
			'create-workout',
			{
				title: 'Create EMOM Workout',
				description:
					'Create a new EMOM workout. Generate a workout with 5 - 10 exercises. Each exercise needs a name, reps, instructions, and optionally a YouTube search keyword for form tutorials.',
				inputSchema: {
					userId: z.string().describe("The user's username. Ask the user for this before calling."),
					title: z.string().describe("The workout title (e.g., 'Upper Body Blast')"),
					description: z.string().describe('Brief description of the workout'),
					durationMinutes: z.number().min(1).max(60).describe('Total workout duration in minutes'),
					intervalSeconds: z.number().min(30).max(120).default(60).describe('Seconds per interval (default: 60)'),
					exercises: z.array(exerciseSchema).min(1).max(10).describe('Array of exercises (4-8 recommended)'),
				},
				annotations: { readOnlyHint: false },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ userId, title, description, durationMinutes, intervalSeconds, exercises }) => {
				const db = drizzle(env.workouts_database);

				const [result] = await db
					.insert(workouts)
					.values({
						userId,
						title,
						description,
						durationMinutes,
						intervalSeconds,
						exercises,
						exerciseCount: exercises.length,
					})
					.returning();

				return {
					content: [{ type: 'text', text: `Created "${title}"\nWorkout ID: ${result.id}\nDescription: ${result.description}` }],
					structuredContent: {
						workout: result,
					},
				};
			},
		);

		// Tool 2: Get all user's workouts
		registerAppTool(
			server,
			'get-workouts',
			{
				title: 'Get Workouts',
				description:
					'Use this to show all saved EMOM workouts. Shows workout titles, durations, and exercise counts. Ask the user which workout they want to view, then use get-workout with that ID.',
				inputSchema: {
					userId: z.string().describe("The user's username. Ask the user for this before calling."),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ userId }) => {
				const db = drizzle(env.workouts_database);

				const result = await db
					.select({
						id: workouts.id,
						title: workouts.title,
						description: workouts.description,
						durationMinutes: workouts.durationMinutes,
						exerciseCount: workouts.exerciseCount,
					})
					.from(workouts)
					.where(eq(workouts.userId, userId))
					.orderBy(workouts.createdAt);

				if (result.length === 0) {
					return {
						content: [{ type: 'text', text: 'No workouts found.' }],
						structuredContent: { workouts: [] },
					};
				}

				const formattedWorkouts = result.map(
					(workout) =>
						`id:${workout.id}\ntitle:${workout.title}\ndescription:${workout.description}\ndurationMinutes:${workout.durationMinutes}\nexerciseCount:${workout.exerciseCount}\n\n========\n\n`,
				);

				return {
					content: [{ type: 'text', text: `Found ${result.length} workouts: \n\n ${formattedWorkouts}` }],
					structuredContent: { workouts: result },
				};
			},
		);

		// Tool 3: Get a specific workout
		registerAppTool(
			server,
			'get-workout',
			{
				title: 'View Workout',
				description:
					'Use this to view a specific EMOM workout with all its exercises. The widget shows a Start Workout button that opens a fullscreen timer session.',
				inputSchema: {
					workoutId: z.string().describe('The workout ID to view'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ workoutId }) => {
				const db = drizzle(env.workouts_database);

				const [result] = await db.select().from(workouts).where(eq(workouts.id, workoutId)).limit(1);

				if (!result) {
					return {
						content: [{ type: 'text', text: 'Workout not found.' }],
						isError: true,
					};
				}

				return {
					content: [
						{
							text: `Viewing "${result.title}" - ${result.durationMinutes} min EMOM with ${result.exercises.length} exercises`,
							type: 'text',
						},
					],
					structuredContent: { workout: result },
				};
			},
		);

		// Tool 4: Delete a workout
		registerAppTool(
			server,
			'delete-workout',
			{
				title: 'Delete Workout',
				description: 'Permanently deletes a workout. This cannot be undone.',
				inputSchema: {
					workoutId: z.string().describe('The workout ID to delete'),
				},
				annotations: { destructiveHint: true },
				_meta: {},
			},
			async ({ workoutId }) => {
				const db = await drizzle(env.workouts_database);

				await db.delete(workouts).where(eq(workouts.id, workoutId));

				return {
					content: [{ type: 'text', text: `Deleted workout ${workoutId}` }],
				};
			},
		);

		// Tool 5: Complete a workout (called from widget after timer finishes)
		registerAppTool(
			server,
			'complete-workout',
			{
				title: 'Complete Workout',
				description: 'Called when a user finishes a workout. Uses Workers AI to estimate calories burned based on the exercises performed.',
				inputSchema: {
					workoutId: z.string().describe('The workout ID that was completed'),
					roundsCompleted: z.number().min(0).describe('Number of rounds the user actually completed'),
				},
				annotations: { readOnlyHint: false },
				_meta: {
					ui: { visibility: ['app'] },
				},
			},
			async ({ workoutId, roundsCompleted }) => {
				const db = drizzle(env.workouts_database);

				const [result] = await db.select().from(workouts).where(eq(workouts.id, workoutId)).limit(1);

				if (!result) {
					return {
						content: [{ type: 'text', text: 'Workout not found' }],
						isError: true,
					};
				}

				const summary = result.exercises.map((e) => `${e.name}: ${e.reps}reps`).join(', ');

				console.log(summary);

				// estimate calories via Workers AI
				const response = (await env.AI.run('@cf/zai-org/glm-5.2' as keyof AiModels, {
					messages: [
						{
							role: 'system',
							content:
								'You are a fitness calorie calculator. Reply only with a single integer representing the calories burned from a workout. No text, no units, nothing else than a single integer.',
						},
						{
							role: 'user',
							content: `I did a EMOM workout. Here is exactly how much I exercised:\n\n	
								- Round completed: ${roundsCompleted}\n
								- Exercises per round: ${summary}`,
						},
					],
				})) as any;

				const calories = response.choices[0].message.content;

				return {
					content: [{ type: 'text', text: `Workout completed! The user burnt ${calories} calories` }],
					structuredContent: { calories: parseInt(calories, 10) },
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
