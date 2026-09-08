## Context

Kuroba is an imageboard API client library for TypeScript. See `proposal.md` for background and `specs/api-client/spec.md` for behavioral requirements. The library must target both Node.js (v18+) and modern browser runtimes with zero external runtime dependencies, providing a clean, ergonomic API that exactly follows the 4chan API specifications (`4chan-API`).

Currently, the workspace contains basic tooling (TypeScript 5.x, Biome, Lefthook) with an empty `src/index.ts`. No HTTP client, error hierarchy, data models, or test runners are configured.

## Goals / Non-Goals

**Goals:**
- **Universal Standards-Based Transport**: Leverage `globalThis.fetch`, `Headers`, and `AbortController` available in Node.js >= 18 and all modern browsers without platform-specific shims.
- **Client & API Shape Definition**: Define the overarching client architecture (`KurobaClient`), configuration options, and endpoint roadmap matching the full `4chan-API` documentation.
- **Robust Error Model**: Structured error classes (`KurobaError`, `KurobaHttpError`, `KurobaRateLimitError`, `KurobaParseError`) preserving HTTP status codes, headers, and request URLs.
- **First-Class Endpoint Implementation**: Implement namespaced `client.boards.list()` / `/boards.json`, `client.boards.raw()`, and `client.media` helpers with complete TypeScript types (`Board`, `BoardCooldowns`, `BoardFlags`, `BoardsResponse`).
- **Caching Compliance**: Support `If-Modified-Since` header formatting and response handling per 4chan API rules.
- **Zero-Dependency Testing**: Establish a lightweight test harness using Node.js built-in `node:test` and `node:assert/strict`.
- **Concise Documentation**: Provide clear, concise usage documentation for Node.js and browser environments.

**Non-Goals:**
- Implementing remaining 4chan endpoints (`threads.json`, `catalog.json`, `archive.json`, index pages, thread details) in this initial change—these are planned into the client shape and will follow in subsequent changes.
- Automated client-side rate-limiting queue/throttle in the initial feature slice (configuration hooks for custom fetch allow external throttling; built-in queuing will be a dedicated follow-up).
- Media downloading or file system saving utilities (URL builders will be designed for media, but actual binary saving is out of scope).

## Decisions

### 1. Client Architecture & Shape
- **Decision**: Structure the client into domain namespaces (`client.boards`, `client.media`) on `KurobaClient`. Do not expose standalone functions.
- **API Shape & Properties**:
  ```ts
  export interface KurobaClientOptions {
    baseUrl?: string;           // default: 'https://a.4cdn.org'
    mediaBaseUrl?: string;      // default: 'https://i.4cdn.org'
    staticBaseUrl?: string;     // default: 'https://s.4cdn.org'
    fetch?: typeof fetch;       // default: globalThis.fetch
    headers?: HeadersInit;      // default global request headers
    timeoutMs?: number;         // default request timeout in milliseconds
  }

  export interface RequestOptions {
    headers?: HeadersInit;
    signal?: AbortSignal;
    timeoutMs?: number;
    ifModifiedSince?: Date;
  }

  export class BoardsEndpoint {
    list(options?: RequestOptions): Promise<Board[]>;
  }

  export class MediaHelper {
    image(board: string, tim: number | string, ext: string): string;
    thumbnail(board: string, tim: number | string): string;
    countryFlag(countryCode: string): string;
    boardFlag(board: string, code: string): string;
    spoiler(): string;
    customSpoiler(board: string, customSpoilerId: number): string;
  }

  export class KurobaClient {
    readonly baseUrl: string;
    readonly mediaBaseUrl: string;
    readonly staticBaseUrl: string;
    readonly timeoutMs?: number;

    readonly boards: BoardsEndpoint;
    readonly media: MediaHelper;

    constructor(options?: KurobaClientOptions);
  }
  ```
- **Rationale**:
  - Discoverability: Autocomplete clearly separates domains (`boards`, `media`, and upcoming `threads`, `catalog`, `archive`).
  - Separation of Concerns: Prevents `KurobaClient` from becoming a bloated god-class owning every method and URL generator.
  - Elimination of Redundancy: Single client instance entry point without duplicate standalone functions.
- **Alternative Considered**:
  - *Flat method layout (`client.getBoards()`)*: Clutters root namespace and requires awkward prefixes on dozens of future methods.
  - *Standalone functions (`getBoards()`)*: Duplicates client instantiation and options plumbing without architectural benefit.
### 2. Cross-Platform HTTP Transport
- **Decision**: Rely entirely on standard `globalThis.fetch`, with an injectable `fetch` property in `KurobaClientOptions`.
- **Rationale**:
  - Supported natively across Node.js (>= 18), Deno, Bun, and modern browsers.
  - Requires zero runtime npm dependencies.
  - Dependency injection of `fetch` makes unit testing and custom proxying/caching trivial.
- **Alternative Considered**:
  - `axios` or `undici`: Adds bundle weight, breaks browser portability, or introduces unnecessary external dependencies.

### 3. Handling Browser CORS Constraints
- **Decision**: Support a configurable `baseUrl` (defaulting to `https://a.4cdn.org`) and custom headers.
- **Rationale**:
  - The 4chan API explicitly documents that CORS is only supported from origins `boards.4chan.org` or `boards.4channel.org`.
  - Browser applications accessing the API from arbitrary web domains require routing through a backend proxy or CORS proxy.
  - Allowing `baseUrl` overrides gives browser developers immediate support without forcing library-level proxy hacks.
- **Alternative Considered**:
  - Hardcoding `https://a.4cdn.org`: Completely breaks all browser usage from non-4chan origins.

### 4. Modular Code Organization
- **Decision**: Structure the source into clear, single-responsibility modules under `src/`:
  - `src/types/boards.ts`: Type definitions for `Board`, `BoardCooldowns`, `BoardFlags`, and `BoardsResponse`.
  - `src/types/options.ts`: `KurobaClientOptions` and `RequestOptions`.
  - `src/errors.ts`: `KurobaError`, `KurobaHttpError`, `KurobaRateLimitError`, `KurobaParseError`.
  - `src/transport.ts`: URL resolution, header assembly (`If-Modified-Since` parsing), fetch dispatch, and error mapping.
  - `src/endpoints/boards.ts`: `BoardsEndpoint` (`list`, `raw`).
  - `src/endpoints/media.ts`: `MediaHelper` (image, thumbnail, flag, spoiler URLs).
  - `src/client.ts`: `KurobaClient` implementation and `createKurobaClient`.
  - `src/index.ts`: Public exports.

### 5. Test Framework Selection
- **Decision**: Use Node's built-in `node:test` runner with `node:assert/strict` and execute tests via `node --test` or TypeScript loader.
- **Rationale**:
  - Zero extra dependencies, instant execution, native ESM compatibility.
  - Allows mocking `fetch` directly using JavaScript function stubs.
- **Alternative Considered**:
  - `vitest` / `jest`: Adds large dependency trees, configuration overhead, and lockfile bloat for simple mock tests.

## Risks / Trade-offs

- **[Risk] 4chan API returns HTML error pages on failure (e.g., Cloudflare 503 or 404)**
  → *Mitigation*: The transport inspects `response.ok` before attempting JSON parsing. Non-2xx responses immediately throw `KurobaHttpError` (or `KurobaRateLimitError` on 429), capturing status code and raw response text safely.
- **[Risk] `If-Modified-Since` receiving 304 Not Modified**
  → *Mitigation*: `client.boards.list()` handles status 304 gracefully, returning an empty array `[]` (`client.boards.raw()` returns `null`) rather than throwing a parse failure.
- **[Risk] Browser environments failing with CORS errors**
  → *Mitigation*: Clear, prominent documentation explaining 4chan's CORS policy and how to set `baseUrl` to a proxy server when developing browser apps.
