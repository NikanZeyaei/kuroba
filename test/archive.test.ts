import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	ArchiveEndpoint,
	KurobaClient,
	KurobaHttpError,
} from "../dist/index.js";

const MOCK_ARCHIVE_DATA = [
	571958, 572866, 54195, 574342, 574378, 574398, 574417, 574426, 574435, 574453,
	574486, 574510, 574586, 574588,
];

describe("client.archive namespace", () => {
	it("initializes archive namespace on KurobaClient", () => {
		const client = new KurobaClient();
		assert.ok(client.archive instanceof ArchiveEndpoint);
	});

	it("list() retrieves and parses archived thread IDs array", async () => {
		let capturedUrl: string | undefined;

		const mockFetch: typeof fetch = async (url) => {
			capturedUrl = String(url);
			return new Response(JSON.stringify(MOCK_ARCHIVE_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const threadIds = await client.archive.list("po");

		assert.equal(capturedUrl, "https://a.4cdn.org/po/archive.json");
		assert.deepEqual(threadIds, MOCK_ARCHIVE_DATA);
		assert.equal(threadIds.length, 14);
		assert.equal(threadIds[0], 571958);
	});
	it("passes If-Modified-Since Date header", async () => {
		let capturedIfModifiedSince: string | null = null;
		const targetDate = new Date("2024-01-01T12:00:00Z");

		const mockFetch: typeof fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			capturedIfModifiedSince = headers.get("If-Modified-Since");
			return new Response(JSON.stringify(MOCK_ARCHIVE_DATA), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		await client.archive.list("po", { ifModifiedSince: targetDate });

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
		const result = await client.archive.list("po", {
			ifModifiedSince: new Date("2024-01-01T12:00:00Z"),
		});

		assert.deepEqual(result, []);
	});

	it("throws KurobaHttpError on boards without archive support (HTTP 404)", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response("Not Found", {
				status: 404,
				statusText: "Not Found",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		await assert.rejects(
			async () => {
				await client.archive.list("b");
			},
			(err: unknown) => {
				if (!(err instanceof KurobaHttpError)) {
					return false;
				}
				assert.equal(err.status, 404);
				assert.equal(err.url, "https://a.4cdn.org/b/archive.json");
				return true;
			},
		);
	});
});
