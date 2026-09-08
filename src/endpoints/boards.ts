import { executeGet, type TransportConfig } from "../transport.js";
import { Board, type RawBoardsResponse } from "../types/boards.js";
import type { RequestOptions } from "../types/options.js";

export class BoardsEndpoint {
	constructor(private readonly transport: TransportConfig) {}

	async list(options?: RequestOptions): Promise<Board[]> {
		const result = await executeGet<RawBoardsResponse>(
			this.transport,
			"boards.json",
			options,
		);
		return result.data?.boards.map((raw) => new Board(raw)) ?? [];
	}
}
