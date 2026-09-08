import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { RawBoardsResponse } from "../dist/index.js";
import { KurobaClient } from "../dist/index.js";

const MOCK_RAW_BOARDS: RawBoardsResponse = {
	boards: [
		{
			board: "a",
			title: "Anime & Manga",
			ws_board: 1,
			per_page: 15,
			pages: 10,
			max_filesize: 4194304,
			max_webm_filesize: 3145728,
			max_comment_chars: 2000,
			max_webm_duration: 120,
			bump_limit: 500,
			image_limit: 300,
			cooldowns: {
				threads: 600,
				replies: 60,
				images: 60,
			},
			meta_description:
				'"/a/ - Anime & Manga" is 4chan\'s imageboard dedicated to Japanese animation.',
			spoilers: 1,
			custom_spoilers: 1,
			is_archived: 1,
		},
		{
			board: "b",
			title: "Random",
			ws_board: 0,
			per_page: 15,
			pages: 10,
			max_filesize: 2097152,
			max_webm_filesize: 2097152,
			max_comment_chars: 2000,
			max_webm_duration: 120,
			bump_limit: 300,
			image_limit: 150,
			cooldowns: {
				threads: 60,
				replies: 15,
				images: 15,
			},
			meta_description: "Random",
			forced_anon: 1,
			board_flags: {
				AB: "Flag Name AB",
			},
		},
	],
};

describe("client.boards namespace", () => {
	it("list() parses and transforms raw wire fields into camelCase properties", async () => {
		const mockFetch: typeof fetch = async (url) => {
			assert.equal(String(url), "https://a.4cdn.org/boards.json");
			return new Response(JSON.stringify(MOCK_RAW_BOARDS), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		const boards = await client.boards.list();

		assert.equal(boards.length, 2);

		// Board /a/ checks
		assert.equal(boards[0]?.board, "a");
		assert.equal(boards[0]?.title, "Anime & Manga");
		assert.equal(boards[0]?.isWorksafe, true); // from ws_board: 1
		assert.equal(boards[0]?.perPage, 15); // from per_page: 15
		assert.equal(boards[0]?.pages, 10);
		assert.equal(boards[0]?.maxFilesize, 4194304); // from max_filesize
		assert.equal(boards[0]?.maxWebmFilesize, 3145728); // from max_webm_filesize
		assert.equal(boards[0]?.bumpLimit, 500); // from bump_limit
		assert.equal(boards[0]?.imageLimit, 300); // from image_limit
		assert.equal(boards[0]?.hasSpoilers, true); // from spoilers: 1
		assert.equal(boards[0]?.customSpoilers, 1); // from custom_spoilers
		assert.equal(boards[0]?.isArchived, true); // from is_archived: 1
		assert.equal(boards[0]?.cooldowns.threads, 600);

		// Board /b/ checks
		assert.equal(boards[1]?.board, "b");
		assert.equal(boards[1]?.isWorksafe, false); // from ws_board: 0
		assert.equal(boards[1]?.forcedAnon, true); // from forced_anon: 1
		assert.deepEqual(boards[1]?.boardFlags, { AB: "Flag Name AB" }); // from board_flags

		// raw property access check
		assert.equal(boards[0]?.raw.ws_board, 1);
		assert.equal(boards[0]?.raw.per_page, 15);
		assert.equal(boards[1]?.raw.forced_anon, 1);
	});

	it("formats and passes If-Modified-Since header as Date", async () => {
		let capturedIfModifiedSince: string | null = null;
		const targetDate = new Date("2024-01-01T12:00:00Z");

		const mockFetch: typeof fetch = async (_url, init) => {
			const headers = new Headers(init?.headers);
			capturedIfModifiedSince = headers.get("If-Modified-Since");
			return new Response(JSON.stringify(MOCK_RAW_BOARDS), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });
		await client.boards.list({ ifModifiedSince: targetDate });

		assert.equal(capturedIfModifiedSince, targetDate.toUTCString());
	});

	it("handles HTTP 304 Not Modified gracefully", async () => {
		const mockFetch: typeof fetch = async () => {
			return new Response(null, {
				status: 304,
				statusText: "Not Modified",
			});
		};

		const client = new KurobaClient({ fetch: mockFetch });

		const boards = await client.boards.list({
			ifModifiedSince: new Date("2018-12-31T17:05:48Z"),
		});
		assert.deepEqual(boards, []);
	});
});
