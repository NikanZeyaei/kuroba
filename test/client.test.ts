import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	ArchiveEndpoint,
	BoardsEndpoint,
	createKurobaClient,
	KurobaClient,
	MediaHelper,
} from "../dist/index.js";

describe("KurobaClient initialization", () => {
	it("initializes with default options and namespaces", () => {
		const client = new KurobaClient();
		assert.equal(client.baseUrl, "https://a.4cdn.org");
		assert.equal(client.mediaBaseUrl, "https://i.4cdn.org");
		assert.equal(client.staticBaseUrl, "https://s.4cdn.org");
		assert.equal(client.timeoutMs, undefined);
		assert.ok(client.boards instanceof BoardsEndpoint);
		assert.ok(client.archive instanceof ArchiveEndpoint);
		assert.ok(client.media instanceof MediaHelper);
	});

	it("initializes with custom options", () => {
		const client = new KurobaClient({
			baseUrl: "https://my-proxy.internal/4chan",
			mediaBaseUrl: "https://media-proxy.internal",
			staticBaseUrl: "https://static-proxy.internal",
			timeoutMs: 5000,
		});

		assert.equal(client.baseUrl, "https://my-proxy.internal/4chan");
		assert.equal(client.mediaBaseUrl, "https://media-proxy.internal");
		assert.equal(client.staticBaseUrl, "https://static-proxy.internal");
		assert.equal(client.timeoutMs, 5000);
	});

	it("createKurobaClient factory instantiates a KurobaClient", () => {
		const client = createKurobaClient({
			baseUrl: "https://example.com/api",
		});
		assert.ok(client instanceof KurobaClient);
		assert.equal(client.baseUrl, "https://example.com/api");
	});

	it("uses injected custom fetch for requests", async () => {
		let capturedUrl: string | undefined;
		let capturedMethod: string | undefined;

		const mockFetch: typeof fetch = async (input, init) => {
			capturedUrl = String(input);
			capturedMethod = init?.method;
			return new Response(JSON.stringify({ boards: [] }), {
				status: 200,
				statusText: "OK",
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({
			baseUrl: "https://proxy.example.com",
			fetch: mockFetch,
		});

		const boards = await client.boards.list();
		assert.deepEqual(boards, []);
		assert.equal(capturedUrl, "https://proxy.example.com/boards.json");
		assert.equal(capturedMethod, "GET");
	});

	it("media helper builds correct media and asset URLs", () => {
		const client = new KurobaClient();

		assert.equal(
			client.media.image("po", 1546293948883, ".png"),
			"https://i.4cdn.org/po/1546293948883.png",
		);
		assert.equal(
			client.media.image("po", 1546293948883, "png"),
			"https://i.4cdn.org/po/1546293948883.png",
		);
		assert.equal(
			client.media.thumbnail("po", 1546293948883),
			"https://i.4cdn.org/po/1546293948883s.jpg",
		);
		assert.equal(
			client.media.countryFlag("US"),
			"https://s.4cdn.org/image/country/us.gif",
		);
		assert.equal(
			client.media.boardFlag("pol", "AB"),
			"https://s.4cdn.org/image/flags/pol/ab.gif",
		);
		assert.equal(
			client.media.spoiler(),
			"https://s.4cdn.org/image/spoiler.png",
		);
		assert.equal(
			client.media.customSpoiler("a", 2),
			"https://s.4cdn.org/image/spoiler-a2.png",
		);
	});
});
