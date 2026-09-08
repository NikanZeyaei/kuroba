import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RawIndexResponse } from "../dist/index.js";
import {
	IndexEndpoint,
	IndexPage,
	KurobaClient,
	KurobaHttpError,
	Post,
	Thread,
} from "../dist/index.js";

const MOCK_INDEX_DATA: RawIndexResponse = {
	threads: [
		{
			posts: [
				{
					no: 570368,
					sticky: 1,
					closed: 1,
					now: "12/31/18(Mon)17:05:48",
					name: "Anonymous",
					sub: "Welcome to /po/!",
					com: "Welcome to /po/! We specialize in origami, papercraft.",
					filename: "yotsuba_folding",
					ext: ".png",
					w: 530,
					h: 449,
					tn_w: 250,
					tn_h: 211,
					tim: 1546293948883,
					time: 1546293948,
					md5: "uZUeZeB14FVR+Mc2ScHvVA==",
					fsize: 516657,
					resto: 0,
					capcode: "mod",
					semantic_url: "welcome-to-po",
					replies: 2,
					images: 2,
					unique_ips: 1,
				},
				{
					no: 570370,
					now: "12/31/18(Mon)17:14:56",
					name: "Anonymous",
					com: "<b>FAQs about papercraft</b>",
					filename: "papercraft faq",
					ext: ".png",
					w: 318,
					h: 704,
					tn_w: 56,
					tn_h: 125,
					tim: 1546294496751,
					time: 1546294496,
					md5: "0EqXBb4gGIyzQiaApMdFAA==",
					fsize: 285358,
					resto: 570368,
					capcode: "mod",
				},
			],
		},
	],
};

describe("client.index namespace", () => {
	it("initializes index namespace on KurobaClient", () => {
		const client = new KurobaClient();
		assert.ok(client.index instanceof IndexEndpoint);
	});

	it("get() defaults to page 1", async () => {
		let capturedUrl: string | undefined;

		const mockFetch: typeof fetch = async (url) => {
			capturedUrl = String(url);
			return new Response(JSON.stringify(MOCK_INDEX_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const page = await client.index.get("po");

		assert.equal(capturedUrl, "https://a.4cdn.org/po/1.json");
		assert.ok(page instanceof IndexPage);
		assert.equal(page.page, 1);
		assert.equal(page.threads.length, 1);

		const thread = page.threads[0];
		assert.ok(thread instanceof Thread);
		assert.equal(thread.id, 570368);
		assert.ok(thread.op instanceof Post);
		assert.equal(thread.op.subject, "Welcome to /po/!");
		assert.equal(thread.replies.length, 1);
		assert.equal(thread.replies[0]?.id, 570370);
	});

	it("get() fetches specific page number", async () => {
		let capturedUrl: string | undefined;

		const mockFetch: typeof fetch = async (url) => {
			capturedUrl = String(url);
			return new Response(JSON.stringify(MOCK_INDEX_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const page = await client.index.get("po", 3);

		assert.equal(capturedUrl, "https://a.4cdn.org/po/3.json");
		assert.equal(page?.page, 3);
	});

	it("passes If-Modified-Since Date header and handles 304", async () => {
		let capturedIfModifiedSince: string | null = null;
		const targetDate = new Date("2024-01-01T12:00:00Z");

		const mockFetch: typeof fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			capturedIfModifiedSince = headers.get("If-Modified-Since");
			return new Response(null, {
				status: 304,
				statusText: "Not Modified",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const page = await client.index.get("po", 1, {
			ifModifiedSince: targetDate,
		});

		assert.equal(capturedIfModifiedSince, targetDate.toUTCString());
		assert.equal(page, null);
	});

	it("throws KurobaHttpError on non-existent board or page (HTTP 404)", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response("Not Found", {
				status: 404,
				statusText: "Not Found",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.index.get("po", 99);
			},
			(err: unknown) => {
				if (!(err instanceof KurobaHttpError)) {
					return false;
				}
				assert.equal(err.status, 404);
				assert.equal(err.url, "https://a.4cdn.org/po/99.json");
				return true;
			},
		);
	});
});
