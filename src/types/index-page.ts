import type { RawPost, Thread } from "./threads.js";

/**
 * Raw wire format of a thread on an index page containing an OP and preview replies.
 * Matches `4chan-API/pages/Indexes.md`.
 */
export interface RawIndexThread {
	/** Array of posts in this thread preview on the index page (OP + preview replies) */
	posts: RawPost[];
}

/**
 * Raw wire format of `https://a.4cdn.org/[board]/[1-15].json`.
 * Matches `4chan-API/pages/Indexes.md`.
 */
export interface RawIndexResponse {
	/** Array of threads on this index page */
	threads: RawIndexThread[];
}

/**
 * Normalized representation of a single board index page (1 to 15).
 * Matches `4chan-API/pages/Indexes.md`.
 */
export class IndexPage {
	constructor(
		/**
		 * The index page number (1-indexed, e.g. 1 to 15).
		 */
		readonly page: number,
		/**
		 * Array of Thread models on this index page, each with OP and preview replies.
		 * @remarks Raw: `threads`
		 */
		readonly threads: Thread[],
		/**
		 * Direct reference to the raw response object.
		 */
		readonly raw: RawIndexResponse,
	) {}
}
