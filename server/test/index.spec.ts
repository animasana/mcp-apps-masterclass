import { describe, expect, it } from "vitest";
import worker from "../src/index";

const ctx = {
	waitUntil() {},
	passThroughOnException() {},
} as unknown as ExecutionContext;

function createEnv(html = "<!doctype html><script src=\"https://server.oogy.workers.dev/assets/app.js\"></script>") {
	return {
		ASSETS: {
			fetch: async (request: Request | string | URL) => {
				const url = new URL(request instanceof Request ? request.url : request.toString());

				if (url.pathname === "/index.html" || url.pathname === "/") {
					return new Response(html, {
						headers: { "content-type": "text/html" },
					});
				}

				return new Response("asset", { status: 200 });
			},
		},
	} as unknown as Env;
}

describe("worker", () => {
	it("serves static assets outside the MCP endpoint", async () => {
		const response = await worker.fetch(
			new Request("https://example.com/assets/app.js"),
			createEnv(),
			ctx,
		);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe("asset");
	});

	it("exposes the MCP endpoint", async () => {
		const response = await worker.fetch(
			new Request("https://example.com/mcp", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					accept: "application/json, text/event-stream",
				},
				body: JSON.stringify({
					jsonrpc: "2.0",
					id: 1,
					method: "tools/list",
				}),
			}),
			createEnv(),
			ctx,
		);

		expect(response.status).not.toBe(404);
	});
});
