import { executeGet, type TransportConfig } from "../transport.js";
import { CatalogPage, type RawCatalogPage } from "../types/catalog.js";
import type { RequestOptions } from "../types/options.js";

export class CatalogEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	/**
	 * Retrieves the full catalog for a board grouped by page.
	 * Fetches `https://a.4cdn.org/[board]/catalog.json`.
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
