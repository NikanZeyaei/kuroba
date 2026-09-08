# Kuroba

A lightweight, type-safe TypeScript API client for 4chan and imageboards based on official [4chan API documentation](https://github.com/4chan/4chan-API).

Works seamlessly in **Node.js (>= 18)** and **modern browsers** using standard `fetch` with zero external runtime dependencies.

## Features

- **Cross-Platform**: Built entirely on standard Web APIs (`fetch`, `Headers`, `AbortController`).
- **Strictly Typed**: TypeScript definitions mirroring 4chan API specifications (`Board`, `Cooldowns`, `BoardFlags`, etc.).
- **Conditional Caching**: First-class support for `If-Modified-Since` headers and `304 Not Modified` responses.
- **Robust Error Handling**: Structured domain errors (`KurobaHttpError`, `KurobaRateLimitError`, `KurobaParseError`).
- **Media & Asset URL Helpers**: Built-in URL builders for post images, thumbnails, country flags, board flags, and spoilers.
- **Zero Runtime Dependencies**: Lightweight and tree-shakeable.

## Installation

```bash
pnpm add kuroba
# or
npm install kuroba
```

## Quickstart

### Node.js

```typescript
import { KurobaClient } from "kuroba";

const client = new KurobaClient();

// Fetch all boards
const boards = await client.boards.list();
for (const board of boards) {
  console.log(`/${board.board}/ - ${board.title} (Worksafe: ${board.ws_board})`);
}
```

### Browser & CORS

4chan's API only sends CORS headers to `boards.4chan.org` or `boards.4channel.org`. In browser applications on other origins, configure `baseUrl` to point to your backend reverse proxy or CORS proxy:

```typescript
import { KurobaClient } from "kuroba";

const client = new KurobaClient({
  baseUrl: "https://your-api-gateway.com/4chan-proxy",
});

const boards = await client.boards.list();
```
## API Reference

### `new KurobaClient(options?: KurobaClientOptions)` / `createKurobaClient(options?)`

Creates a client instance.

#### Options (`KurobaClientOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `string` | `"https://a.4cdn.org"` | Base API domain or proxy URL. |
| `mediaBaseUrl` | `string` | `"https://i.4cdn.org"` | Base domain for user attachments and thumbnails. |
| `staticBaseUrl` | `string` | `"https://s.4cdn.org"` | Base domain for site assets, icons, and flags. |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch function (for mocking, proxies, or rate-limit wrappers). |
| `headers` | `HeadersInit` | `undefined` | Global headers applied to all requests. |
| `timeoutMs` | `number` | `undefined` | Request timeout duration in milliseconds. |

### Namespaces

#### `client.boards`

- **`client.boards.list(options?: RequestOptions): Promise<Board[]>`**: Fetches `https://a.4cdn.org/boards.json` and returns the array of `Board` models (returns empty array `[]` on HTTP 304 Not Modified). Raw untouched wire JSON is accessible on each board instance via `board.raw`.

#### `client.archive`

- **`client.archive.list(board: string, options?: RequestOptions): Promise<number[]>`**: Fetches `https://a.4cdn.org/[board]/archive.json` and returns an array of archived thread IDs (numbers). Returns empty array `[]` on HTTP 304 Not Modified. Throws `KurobaHttpError` (404) if the board has no archive enabled.

#### `client.catalog`

- **`client.catalog.list(board: string, options?: RequestOptions): Promise<CatalogPage[]>`**: Fetches `https://a.4cdn.org/[board]/catalog.json` and returns the array of `CatalogPage` models containing threads and preview replies. Returns empty array `[]` on HTTP 304 Not Modified.

#### `client.threads`

- **`client.threads.get(board: string, threadId: number, options?: RequestOptions): Promise<Thread | null>`**: Fetches `https://a.4cdn.org/[board]/thread/[threadId].json` and returns a complete `Thread` model (with `thread.op`, `thread.replies`, `thread.postCount`, etc.). Returns `null` on HTTP 304 Not Modified. Throws `KurobaHttpError` (404) if the thread was pruned or does not exist.
- **`client.threads.list(board: string, options?: RequestOptions): Promise<ThreadListPage[]>`**: Fetches `https://a.4cdn.org/[board]/threads.json` and returns a lightweight summarized list of all threads across all board pages (IDs, modification timestamps, reply counts). Returns empty array `[]` on HTTP 304 Not Modified.

#### `client.media`

URL helper methods for static and user-uploaded assets:

```typescript
// Attachment image: https://i.4cdn.org/po/1546293948883.png
client.media.image("po", 1546293948883, ".png");

// Thumbnail: https://i.4cdn.org/po/1546293948883s.jpg
client.media.thumbnail("po", 1546293948883);

// Country flag: https://s.4cdn.org/image/country/us.gif
client.media.countryFlag("US");

// Board flag: https://s.4cdn.org/image/flags/pol/ab.gif
client.media.boardFlag("pol", "AB");

// Default spoiler: https://s.4cdn.org/image/spoiler.png
client.media.spoiler();

// Custom board spoiler: https://s.4cdn.org/image/spoiler-a1.png
client.media.customSpoiler("a", 1);
```
#### Request Options (`RequestOptions`)

| Option | Type | Description |
| :--- | :--- | :--- |
| `headers` | `HeadersInit` | Additional request headers. |
| `signal` | `AbortSignal` | AbortSignal for cancellation. |
| `timeoutMs` | `number` | Timeout override in milliseconds for this request. |
| `ifModifiedSince` | `Date` | Date sent in the `If-Modified-Since` header. |

### Error Handling

All client errors extend `KurobaError`:

```typescript
import {
  KurobaError,
  KurobaHttpError,
  KurobaRateLimitError,
  KurobaParseError,
} from "kuroba";

try {
  const boards = await client.boards.list();
} catch (err) {
  if (err instanceof KurobaRateLimitError) {
    // HTTP 429 Too Many Requests
    console.error("Exceeded 1 request/sec rate limit:", err.status);
  } else if (err instanceof KurobaHttpError) {
    // Non-2xx response (404, 500, etc.)
    console.error(`HTTP ${err.status} from ${err.url}:`, err.responseBody);
  } else if (err instanceof KurobaParseError) {
    // Invalid JSON body returned (e.g. HTML error page)
    console.error(`Failed to parse response:`, err.rawText);
  } else {
    throw err;
  }
}
```

## License

MIT
