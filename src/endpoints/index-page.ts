import { executeGet, type TransportConfig } from "../transport.js";
import { IndexPage, type RawIndexResponse } from "../types/index-page.js";
import type { RequestOptions } from "../types/options.js";
import { Post, Thread } from "../types/threads.js";

/**
 * Endpoint for board main index pages.
 * Ref: `4chan-API/pages/Indexes.md`
 */
export class IndexEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves a specific board index page (1 to 15) containing active threads and their preview replies.
	 * Fetches `https://a.4cdn.org/[board]/[page].json`.
	 *
	 * Ref: `4chan-API/pages/Indexes.md`
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param page Index page number (1-indexed, defaults to 1).
	 * @param options Optional request options (`headers`, `signal`, `timeoutMs`, `ifModifiedSince`).
	 * @returns The `IndexPage` model or `null` on HTTP 304 Not Modified.
	 * @throws `KurobaHttpError` with status 404 if the page or board does not exist.
	 * @throws `KurobaRateLimitError` if HTTP 429 Too Many Requests is received.
	 * @throws `KurobaParseError` if JSON response parsing fails.
	 */
	async get(
		board: string,
		page = 1,
		options?: RequestOptions,
	): Promise<IndexPage | null> {
		const result = await executeGet<RawIndexResponse>(
			this.transport,
			`${board}/${page}.json`,
			options,
		);
		if (result.notModified || !result.data) {
			return null;
		}

		const threads = result.data.threads.map(
			(rawThread) =>
				new Thread(
					rawThread.posts.map((rawPost) => new Post(rawPost)),
					rawThread,
				),
		);

		return new IndexPage(page, threads, result.data);
	}
}
