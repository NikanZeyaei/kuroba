import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	KurobaClient,
	KurobaError,
	KurobaHttpError,
	KurobaParseError,
	KurobaRateLimitError,
} from "../dist/index.js";

describe("Error handling and classes", () => {
	it("KurobaHttpError contains status, statusText, url, headers, and body", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response("Not Found", {
				status: 404,
				statusText: "Not Found",
				headers: { "X-Custom-Header": "value123" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.boards.list();
			},
			(err: unknown) => {
				assert.ok(err instanceof KurobaError);
				assert.ok(err instanceof KurobaHttpError);
				assert.equal(err.status, 404);
				assert.equal(err.statusText, "Not Found");
				assert.equal(err.url, "https://a.4cdn.org/boards.json");
				assert.equal(err.headers.get("X-Custom-Header"), "value123");
				assert.equal(err.responseBody, "Not Found");
				assert.equal(err.name, "KurobaHttpError");
				return true;
			},
		);
	});

	it("KurobaRateLimitError is thrown on HTTP 429 Too Many Requests", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response("Our systems have detected excessive requests.", {
				status: 429,
				statusText: "Too Many Requests",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.boards.list();
			},
			(err: unknown) => {
				assert.ok(err instanceof KurobaRateLimitError);
				assert.ok(err instanceof KurobaHttpError);
				assert.ok(err instanceof KurobaError);
				assert.equal(err.status, 429);
				assert.equal(err.name, "KurobaRateLimitError");
				assert.match(err.message, /rate limit exceeded/);
				return true;
			},
		);
	});

	it("KurobaParseError is thrown when response body is not valid JSON", async () => {
		const htmlResponse = "<!DOCTYPE html><html><body>Error page</body></html>";
		const mockFetch: typeof fetch = async () => {
			return new Response(htmlResponse, {
				status: 200,
				statusText: "OK",
				headers: { "Content-Type": "text/html" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.boards.list();
			},
			(err: unknown) => {
				assert.ok(err instanceof KurobaParseError);
				assert.ok(err instanceof KurobaError);
				assert.equal(err.rawText, htmlResponse);
				assert.equal(err.url, "https://a.4cdn.org/boards.json");
				assert.ok(err.cause instanceof SyntaxError);
				assert.equal(err.name, "KurobaParseError");
				return true;
			},
		);
	});

	it("aborts when request exceeds configured timeout", async () => {
		const mockFetch: typeof fetch = async (_url, init) => {
			const { promise, reject } = Promise.withResolvers<Response>();
			const signal = init?.signal;
			if (signal) {
				signal.addEventListener("abort", () => {
					reject(signal.reason);
				});
			}
			return promise;
		};

		const client = new KurobaClient({
			fetch: mockFetch,
			timeoutMs: 15,
		});

		await assert.rejects(
			async () => {
				await client.boards.list();
			},
			(err: unknown) => {
				assert.ok(err instanceof DOMException || err instanceof Error);
				assert.match(String(err), /timed out/i);
				return true;
			},
		);
	});

	it("supports direct manual instantiation of error classes", () => {
		const headers = new Headers({ "content-type": "text/plain" });

		const httpError = new KurobaHttpError("Failed", {
			status: 500,
			statusText: "Internal Server Error",
			url: "https://example.com",
			headers,
			responseBody: "Crash",
		});
		assert.equal(httpError.status, 500);
		assert.equal(httpError.responseBody, "Crash");

		const rateLimitError = new KurobaRateLimitError({
			url: "https://example.com",
			headers,
		});
		assert.equal(rateLimitError.status, 429);
		assert.equal(rateLimitError.statusText, "Too Many Requests");

		const parseError = new KurobaParseError("Malformed", {
			url: "https://example.com",
			rawText: "{ bad json",
		});
		assert.equal(parseError.rawText, "{ bad json");
	});
});
