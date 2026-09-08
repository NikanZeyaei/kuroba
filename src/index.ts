export { createKurobaClient, KurobaClient } from "./client.js";
export { ArchiveEndpoint } from "./endpoints/archive.js";
export { BoardsEndpoint } from "./endpoints/boards.js";
export { CatalogEndpoint } from "./endpoints/catalog.js";
export { IndexEndpoint } from "./endpoints/index-page.js";
export { MediaHelper } from "./endpoints/media.js";
export { ThreadsEndpoint } from "./endpoints/threads.js";

export {
	KurobaError,
	KurobaHttpError,
	KurobaParseError,
	KurobaRateLimitError,
} from "./errors.js";

export {
	buildUrl,
	type TimeoutHandle,
	type TransportConfig,
	type TransportResult,
} from "./transport.js";

export {
	Board,
	type BoardCooldowns,
	type BoardFlags,
	type RawBoard,
	type RawBoardsResponse,
	transformBoard,
} from "./types/boards.js";

export {
	CatalogPage,
	CatalogReply,
	CatalogThread,
	type RawCatalogPage,
	type RawCatalogReply,
	type RawCatalogThread,
} from "./types/catalog.js";

export {
	IndexPage,
	type RawIndexResponse,
	type RawIndexThread,
} from "./types/index-page.js";
export type {
	KurobaClientOptions,
	RequestOptions,
} from "./types/options.js";
export {
	Post,
	type RawPost,
	type RawThreadListItem,
	type RawThreadListPage,
	type RawThreadResponse,
	Thread,
	ThreadListItem,
	ThreadListPage,
} from "./types/threads.js";
