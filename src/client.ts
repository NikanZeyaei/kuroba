import { ArchiveEndpoint } from "./endpoints/archive.js";
import { BoardsEndpoint } from "./endpoints/boards.js";
import { CatalogEndpoint } from "./endpoints/catalog.js";
import { IndexEndpoint } from "./endpoints/index-page.js";
import { MediaHelper } from "./endpoints/media.js";
import { ThreadsEndpoint } from "./endpoints/threads.js";
import type { TransportConfig } from "./transport.js";
import type { KurobaClientOptions } from "./types/options.js";

const DEFAULT_API_BASE_URL = "https://a.4cdn.org";
const DEFAULT_MEDIA_BASE_URL = "https://i.4cdn.org";
const DEFAULT_STATIC_BASE_URL = "https://s.4cdn.org";

/**
 * Universal type-safe API client for 4chan.
 * Compatible with Node.js (>= 18) and modern browser runtimes.
 */
export class KurobaClient {
	/** Base API domain (default: `https://a.4cdn.org`) */
	readonly baseUrl: string;
	/** Base domain for attachments and thumbnails (default: `https://i.4cdn.org`) */
	readonly mediaBaseUrl: string;
	/** Base domain for static site icons and flags (default: `https://s.4cdn.org`) */
	readonly staticBaseUrl: string;
	/** Default request timeout in milliseconds */
	readonly timeoutMs?: number | undefined;

	/** Endpoint for board metadata and directory information (`boards.json`) */
	readonly boards: BoardsEndpoint;
	/** Endpoint for full board catalogs (`[board]/catalog.json`) */
	readonly catalog: CatalogEndpoint;
	/** Endpoint for board archives (`[board]/archive.json`) */
	readonly archive: ArchiveEndpoint;
	/** Endpoint for full threads and thread list summaries */
	readonly threads: ThreadsEndpoint;
	/** Endpoint for board index pages (`[board]/[1-15].json`) */
	readonly index: IndexEndpoint;
	/** URL generator for attachment images, thumbnails, flags, and spoilers */
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
		this.catalog = new CatalogEndpoint(transport);
		this.archive = new ArchiveEndpoint(transport);
		this.threads = new ThreadsEndpoint(transport);
		this.index = new IndexEndpoint(transport);
		this.media = new MediaHelper(this.mediaBaseUrl, this.staticBaseUrl);
	}
}

/**
 * Functional factory for creating a new `KurobaClient` instance.
 */
export function createKurobaClient(
	options?: KurobaClientOptions,
): KurobaClient {
	return new KurobaClient(options);
}
