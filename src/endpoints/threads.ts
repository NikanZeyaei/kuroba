import { executeGet, type TransportConfig } from "../transport.js";
import type { RequestOptions } from "../types/options.js";
import {
	Post,
	type RawThreadListPage,
	type RawThreadResponse,
	Thread,
	ThreadListPage,
} from "../types/threads.js";

/**
 * Endpoint for full threads and summarized thread lists.
 * Ref: `4chan-API/pages/Threads.md` and `Threadlist.md`
 */
export class ThreadsEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves a complete thread with all posts from `https://a.4cdn.org/[board]/thread/[threadId].json`.
	 *
	 * Ref: `4chan-API/pages/Threads.md`
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param threadId The OP post number of the thread.
	 * @param options Optional request options (`headers`, `signal`, `timeoutMs`, `ifModifiedSince`).
	 * @returns The `Thread` model containing `op` and all `replies`, or `null` on HTTP 304 Not Modified.
	 * @throws `KurobaHttpError` with status 404 if the thread was pruned or does not exist.
	 * @throws `KurobaRateLimitError` if HTTP 429 Too Many Requests is received.
	 * @throws `KurobaParseError` if JSON response parsing fails.
	 */
	async get(
		board: string,
		threadId: number,
		options?: RequestOptions,
	): Promise<Thread | null> {
		const result = await executeGet<RawThreadResponse>(
			this.transport,
			`${board}/thread/${threadId}.json`,
			options,
		);
		if (result.notModified || !result.data) {
			return null;
		}
		const posts = result.data.posts.map((raw) => new Post(raw));
		return new Thread(posts, result.data);
	}

	/**
	 * Retrieves the summarized thread list for a board from `https://a.4cdn.org/[board]/threads.json`.
	 *
	 * Ref: `4chan-API/pages/Threadlist.md`
	 *
	 * Useful for lightweight polling to detect thread modifications without downloading full catalogs.
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param options Optional request options (`headers`, `signal`, `timeoutMs`, `ifModifiedSince`).
	 * @returns Array of `ThreadListPage` models with thread IDs and timestamps. Returns empty array `[]` on HTTP 304 Not Modified.
	 * @throws `KurobaHttpError` on non-2xx HTTP response codes.
	 * @throws `KurobaRateLimitError` if HTTP 429 Too Many Requests is received.
	 * @throws `KurobaParseError` if JSON response parsing fails.
	 */
	async list(
		board: string,
		options?: RequestOptions,
	): Promise<ThreadListPage[]> {
		const result = await executeGet<RawThreadListPage[]>(
			this.transport,
			`${board}/threads.json`,
			options,
		);
		return result.data?.map((page) => new ThreadListPage(page)) ?? [];
	}
}
