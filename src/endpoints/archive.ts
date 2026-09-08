import { executeGet, type TransportConfig } from "../transport.js";
import type { RequestOptions } from "../types/options.js";

/**
 * Endpoint for board archives.
 * Ref: `4chan-API/pages/Archive.md`
 */
export class ArchiveEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves the list of closed/archived thread IDs for a board.
	 * Fetches `https://a.4cdn.org/[board]/archive.json`.
	 *
	 * Note: Not all boards have archives enabled; unarchived boards return HTTP 404.
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param options Optional request options (`headers`, `signal`, `timeoutMs`, `ifModifiedSince`).
	 * @returns Array of numeric OP thread IDs. Returns empty array `[]` on HTTP 304 Not Modified.
	 * @throws `KurobaHttpError` with status 404 if the board has no archives or does not exist.
	 * @throws `KurobaRateLimitError` if HTTP 429 Too Many Requests is received.
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
