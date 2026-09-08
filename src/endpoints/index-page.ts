import { executeGet, type TransportConfig } from "../transport.js";
import { IndexPage, type RawIndexResponse } from "../types/index-page.js";
import type { RequestOptions } from "../types/options.js";
import { Post, Thread } from "../types/threads.js";

export class IndexEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves an index page (1 to 15) for a board containing threads and preview replies.
	 * Fetches `https://a.4cdn.org/[board]/[page].json`.
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param page Index page number (defaults to 1).
	 * @param options Request options.
	 * @returns The IndexPage model or null on 304 Not Modified. Throws KurobaHttpError on 404.
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
