import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RawCatalogPage } from "../dist/index.js";
import {
	CatalogEndpoint,
	CatalogPage,
	CatalogReply,
	CatalogThread,
	KurobaClient,
	KurobaHttpError,
} from "../dist/index.js";

const MOCK_CATALOG_DATA: RawCatalogPage[] = [
	{
		page: 1,
		threads: [
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
				omitted_posts: 1,
				omitted_images: 1,
				last_replies: [
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
				last_modified: 1546294897,
			},
		],
	},
	{
		page: 2,
		threads: [
			{
				no: 568362,
				now: "10/05/18(Fri)13:53:57",
				name: "Anonymous",
				com: "This is a comment!",
				filename: "IMG_20181005_181107-1",
				ext: ".jpg",
				w: 373,
				h: 654,
				tn_w: 142,
				tn_h: 250,
				tim: 1538762037790,
				time: 1538762037,
				md5: "HTvheK4HTgbXKRqMQ0vrXA==",
				fsize: 48770,
				resto: 0,
				bumplimit: 0,
				imagelimit: 0,
				semantic_url: "my-girlfriends-birthday",
				replies: 55,
				images: 7,
				omitted_posts: 50,
				omitted_images: 7,
				last_modified: 1566367619,
			},
		],
	},
];

describe("client.catalog namespace", () => {
	it("initializes catalog namespace on KurobaClient", () => {
		const client = new KurobaClient();
		assert.ok(client.catalog instanceof CatalogEndpoint);
	});

	it("list() retrieves and parses catalog pages with threads and replies", async () => {
		let capturedUrl: string | undefined;

		const mockFetch: typeof fetch = async (url) => {
			capturedUrl = String(url);
			return new Response(JSON.stringify(MOCK_CATALOG_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const pages = await client.catalog.list("po");

		assert.equal(capturedUrl, "https://a.4cdn.org/po/catalog.json");
		assert.equal(pages.length, 2);

		// Page 1 checks
		const page1 = pages[0];
		assert.ok(page1 instanceof CatalogPage);
		assert.equal(page1.page, 1);
		assert.equal(page1.threads.length, 1);

		// Thread checks
		const thread1 = page1.threads[0];
		assert.ok(thread1 instanceof CatalogThread);
		assert.equal(thread1.id, 570368);
		assert.equal(thread1.isSticky, true);
		assert.equal(thread1.isClosed, true);
		assert.equal(thread1.subject, "Welcome to /po/!");
		assert.equal(
			thread1.comment,
			"Welcome to /po/! We specialize in origami, papercraft.",
		);
		assert.equal(thread1.replies, 2);
		assert.equal(thread1.images, 2);
		assert.equal(thread1.omittedPosts, 1);
		assert.equal(thread1.omittedImages, 1);
		assert.equal(thread1.semanticUrl, "welcome-to-po");
		assert.equal(thread1.raw.no, 570368);

		// Preview replies checks
		assert.equal(thread1.lastReplies.length, 1);
		const reply1 = thread1.lastReplies[0];
		assert.ok(reply1 instanceof CatalogReply);
		assert.equal(reply1.id, 570371);
		assert.equal(reply1.comment, "<b>FAQs about origami</b>");
		assert.equal(reply1.resto, 570368);
		assert.equal(reply1.raw.no, 570371);

		// Page 2 checks
		const page2 = pages[1];
		assert.equal(page2?.page, 2);
		assert.equal(page2?.threads[0]?.id, 568362);
		assert.equal(page2?.threads[0]?.omittedPosts, 50);
	});

	it("passes If-Modified-Since Date header", async () => {
		let capturedIfModifiedSince: string | null = null;
		const targetDate = new Date("2024-01-01T12:00:00Z");

		const mockFetch: typeof fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			capturedIfModifiedSince = headers.get("If-Modified-Since");
			return new Response(JSON.stringify(MOCK_CATALOG_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		await client.catalog.list("po", { ifModifiedSince: targetDate });

		assert.equal(capturedIfModifiedSince, targetDate.toUTCString());
	});

	it("handles HTTP 304 Not Modified gracefully by returning empty array", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response(null, {
				status: 304,
				statusText: "Not Modified",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const result = await client.catalog.list("po", {
			ifModifiedSince: new Date("2024-01-01T12:00:00Z"),
		});

		assert.deepEqual(result, []);
	});

	it("throws KurobaHttpError on non-existent board (HTTP 404)", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response("Not Found", {
				status: 404,
				statusText: "Not Found",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.catalog.list("invalid_board");
			},
			(err: unknown) => {
				if (!(err instanceof KurobaHttpError)) {
					return false;
				}
				assert.equal(err.status, 404);
				assert.equal(err.url, "https://a.4cdn.org/invalid_board/catalog.json");
				return true;
			},
		);
	});
});
