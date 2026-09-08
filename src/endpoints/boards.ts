import { executeGet, type TransportConfig } from "../transport.js";
import { Board, type RawBoardsResponse } from "../types/boards.js";
import type { RequestOptions } from "../types/options.js";

/**
 * Endpoint for board metadata and directory information.
 * Ref: `4chan-API/pages/Boards.md`
 */
export class BoardsEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves the comprehensive list of all 4chan boards and their settings.
	 * Fetches `https://a.4cdn.org/boards.json`.
	 *
	 * @param options Optional request options (`headers`, `signal`, `timeoutMs`, `ifModifiedSince`).
	 * @returns Array of normalized `Board` models. Returns empty array `[]` on HTTP 304 Not Modified.
	 * @throws `KurobaHttpError` on non-2xx HTTP response codes.
	 * @throws `KurobaRateLimitError` if HTTP 429 Too Many Requests is received.
	 * @throws `KurobaParseError` if JSON response parsing fails.
	 */
	async list(options?: RequestOptions): Promise<Board[]> {
		const result = await executeGet<RawBoardsResponse>(
			this.transport,
			"boards.json",
			options,
		);
		return result.data?.boards.map((raw) => new Board(raw)) ?? [];
	}
}
