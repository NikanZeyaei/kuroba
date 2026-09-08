import { executeGet, type TransportConfig } from "../transport.js";
import type { RequestOptions } from "../types/options.js";
import {
	Post,
	type RawThreadListPage,
	type RawThreadResponse,
	Thread,
	ThreadListPage,
} from "../types/threads.js";

export class ThreadsEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves a complete thread with all posts from `https://a.4cdn.org/[board]/thread/[threadId].json`.
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param threadId The OP number of the thread.
	 * @param options Request options.
	 * @returns The Thread model or null on 304 Not Modified. Throws KurobaHttpError on 404.
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
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param options Request options.
	 * @returns Array of ThreadListPage models. Returns empty array on 304 Not Modified.
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
