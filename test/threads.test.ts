import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RawThreadListPage, RawThreadResponse } from "../dist/index.js";
import {
	KurobaClient,
	KurobaHttpError,
	Post,
	Thread,
	ThreadListItem,
	ThreadListPage,
	ThreadsEndpoint,
} from "../dist/index.js";

const MOCK_THREAD_DATA: RawThreadResponse = {
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
		{
			no: 570371,
			now: "12/31/18(Mon)17:21:29",
			name: "Anonymous",
			com: "<b>FAQs about origami</b>",
			filename: "origami faq",
			ext: ".jpg",
			w: 762,
			h: 762,
			tn_w: 125,
			tn_h: 125,
			tim: 1546294889019,
			time: 1546294889,
			md5: "vKWr7+oITdUBu7bUaypuCw==",
			fsize: 163110,
			resto: 570368,
			capcode: "mod",
		},
	],
};

const MOCK_THREAD_LIST_DATA: RawThreadListPage[] = [
	{
		page: 1,
		threads: [
			{
				no: 570368,
				last_modified: 1546294897,
				replies: 2,
			},
			{
				no: 567982,
				last_modified: 1566438201,
				replies: 63,
			},
		],
	},
	{
		page: 2,
		threads: [
			{
				no: 575972,
				last_modified: 1566435330,
				replies: 2,
			},
		],
	},
];

describe("client.threads namespace", () => {
	it("initializes threads namespace on KurobaClient", () => {
		const client = new KurobaClient();
		assert.ok(client.threads instanceof ThreadsEndpoint);
	});

	it("get() fetches and parses a full thread with OP and replies", async () => {
		let capturedUrl: string | undefined;

		const mockFetch: typeof fetch = async (url) => {
			capturedUrl = String(url);
			return new Response(JSON.stringify(MOCK_THREAD_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const thread = await client.threads.get("po", 570368);

		assert.ok(thread instanceof Thread);
		assert.equal(capturedUrl, "https://a.4cdn.org/po/thread/570368.json");
		assert.equal(thread.id, 570368);
		assert.equal(thread.subject, "Welcome to /po/!");
		assert.equal(thread.isSticky, true);
		assert.equal(thread.isClosed, true);
		assert.equal(thread.postCount, 3);

		// OP checks
		const op = thread.op;
		assert.ok(op instanceof Post);
		assert.equal(op.id, 570368);
		assert.equal(op.isOp, true);
		assert.equal(op.resto, 0);
		assert.equal(op.filename, "yotsuba_folding");
		assert.equal(op.extension, ".png");
		assert.equal(op.width, 530);
		assert.equal(op.height, 449);
		assert.equal(op.raw.no, 570368);

		// Replies checks
		assert.equal(thread.replies.length, 2);
		const reply1 = thread.replies[0];
		assert.ok(reply1 instanceof Post);
		assert.equal(reply1?.id, 570370);
		assert.equal(reply1?.isOp, false);
		assert.equal(reply1?.resto, 570368);
		assert.equal(reply1?.filename, "papercraft faq");
	});

	it("get() passes If-Modified-Since Date header and handles 304", async () => {
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
		const thread = await client.threads.get("po", 570368, {
			ifModifiedSince: targetDate,
		});

		assert.equal(capturedIfModifiedSince, targetDate.toUTCString());
		assert.equal(thread, null);
	});

	it("get() throws KurobaHttpError on missing/pruned thread (HTTP 404)", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response("Not Found", {
				status: 404,
				statusText: "Not Found",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.threads.get("po", 99999999);
			},
			(err: unknown) => {
				if (!(err instanceof KurobaHttpError)) {
					return false;
				}
				assert.equal(err.status, 404);
				assert.equal(err.url, "https://a.4cdn.org/po/thread/99999999.json");
				return true;
			},
		);
	});

	it("list() fetches and parses thread list pages", async () => {
		let capturedUrl: string | undefined;

		const mockFetch: typeof fetch = async (url) => {
			capturedUrl = String(url);
			return new Response(JSON.stringify(MOCK_THREAD_LIST_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const pages = await client.threads.list("po");

		assert.equal(capturedUrl, "https://a.4cdn.org/po/threads.json");
		assert.equal(pages.length, 2);

		const page1 = pages[0];
		assert.ok(page1 instanceof ThreadListPage);
		assert.equal(page1.page, 1);
		assert.equal(page1.threads.length, 2);

		const thread1 = page1.threads[0];
		assert.ok(thread1 instanceof ThreadListItem);
		assert.equal(thread1.id, 570368);
		assert.equal(thread1.lastModified, 1546294897);
		assert.equal(thread1.replies, 2);
		assert.equal(thread1.raw.no, 570368);
	});

	it("list() passes If-Modified-Since Date header and handles 304", async () => {
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
		const pages = await client.threads.list("po", {
			ifModifiedSince: targetDate,
		});

		assert.equal(capturedIfModifiedSince, targetDate.toUTCString());
		assert.deepEqual(pages, []);
	});
});
