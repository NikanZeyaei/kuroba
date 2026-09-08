import { BoardsEndpoint } from "./endpoints/boards.js";
import { MediaHelper } from "./endpoints/media.js";
import type { TransportConfig } from "./transport.js";
import type { KurobaClientOptions } from "./types/options.js";

const DEFAULT_API_BASE_URL = "https://a.4cdn.org";
const DEFAULT_MEDIA_BASE_URL = "https://i.4cdn.org";
const DEFAULT_STATIC_BASE_URL = "https://s.4cdn.org";

export class KurobaClient {
	readonly baseUrl: string;
	readonly mediaBaseUrl: string;
	readonly staticBaseUrl: string;
	readonly timeoutMs?: number | undefined;

	readonly boards: BoardsEndpoint;
	readonly media: MediaHelper;

	constructor(options?: KurobaClientOptions) {
		this.baseUrl = options?.baseUrl ?? DEFAULT_API_BASE_URL;
		this.mediaBaseUrl = options?.mediaBaseUrl ?? DEFAULT_MEDIA_BASE_URL;
		this.staticBaseUrl = options?.staticBaseUrl ?? DEFAULT_STATIC_BASE_URL;
		this.timeoutMs = options?.timeoutMs;

		const fetchFn =
			options?.fetch ??
			(typeof globalThis.fetch === "function"
				? globalThis.fetch.bind(globalThis)
				: undefined);

		if (!fetchFn) {
			throw new Error(
				"No fetch implementation found. Ensure globalThis.fetch is available or supply a custom fetch option.",
			);
		}

		const transport: TransportConfig = {
			baseUrl: this.baseUrl,
			fetch: fetchFn,
			defaultHeaders: options?.headers,
			defaultTimeoutMs: options?.timeoutMs,
		};

		this.boards = new BoardsEndpoint(transport);
		this.media = new MediaHelper(this.mediaBaseUrl, this.staticBaseUrl);
	}
}

export function createKurobaClient(
	options?: KurobaClientOptions,
): KurobaClient {
	return new KurobaClient(options);
}
