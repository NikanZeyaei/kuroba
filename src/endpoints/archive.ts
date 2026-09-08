import { executeGet, type TransportConfig } from "../transport.js";
import type { RequestOptions } from "../types/options.js";

export class ArchiveEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves the list of archived thread IDs for a board.
	 * Fetches `https://a.4cdn.org/[board]/archive.json`.
	 */
	async list(board: string, options?: RequestOptions): Promise<number[]> {
		const result = await executeGet<number[]>(
			this.transport,
			`${board}/archive.json`,
			options,
		);
		return result.data ?? [];
	}
}
