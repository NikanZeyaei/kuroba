import { executeGet, type TransportConfig } from "../transport.js";
import { CatalogPage, type RawCatalogPage } from "../types/catalog.js";
import type { RequestOptions } from "../types/options.js";

/**
 * Endpoint for board catalogs.
 * Ref: `4chan-API/pages/Catalog.md`
 */
export class CatalogEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves the full catalog for a board grouped by page.
	 * Fetches `https://a.4cdn.org/[board]/catalog.json`.
	 *
	 * Each catalog page includes all active OP threads along with their preview replies.
	 *
	 * @param board Board abbreviation (e.g. "po", "g", "a").
	 * @param options Optional request options (`headers`, `signal`, `timeoutMs`, `ifModifiedSince`).
	 * @returns Array of `CatalogPage` models. Returns empty array `[]` on HTTP 304 Not Modified.
	 * @throws `KurobaHttpError` on non-2xx HTTP response codes.
	 * @throws `KurobaRateLimitError` if HTTP 429 Too Many Requests is received.
	 * @throws `KurobaParseError` if JSON response parsing fails.
	 */
	async list(board: string, options?: RequestOptions): Promise<CatalogPage[]> {
		const result = await executeGet<RawCatalogPage[]>(
			this.transport,
			`${board}/catalog.json`,
			options,
		);
		return result.data?.map((page) => new CatalogPage(page)) ?? [];
	}
}
