import type { RawPost, Thread } from "./threads.js";

export interface RawIndexThread {
	posts: RawPost[];
}

export interface RawIndexResponse {
	threads: RawIndexThread[];
}

export class IndexPage {
	constructor(
		readonly page: number,
		readonly threads: Thread[],
		readonly raw: RawIndexResponse,
	) {}
}
