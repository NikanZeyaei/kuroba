## Why

Kuroba requires a lightweight, type-safe, cross-platform TypeScript client for the 4chan read-only JSON API matching the official documentation in `4chan-API`. Currently, `src/index.ts` is an empty export with no client structure, types, or test suite. Establishing an extensible, standards-based HTTP client architecture (Node.js and modern browsers via standard `fetch`) with typed errors, caching support (`If-Modified-Since`), and the initial `boards.json` endpoint delivers an immediate, functional feature while laying the groundwork for remaining endpoints (`threads`, `catalog`, `indexes`, `archive`, and media URLs).

## What Changes

- **Universal Client Core**: Create `KurobaClient` class and `createKurobaClient()` factory that run in both Node.js (>= 18) and browser environments using standard Web `fetch`.
- **Client Configuration & Options**: Provide configurable client options:
  - `baseUrl`: Base API endpoint (default: `https://a.4cdn.org`, configurable for proxies/mirrors).
  - `fetch`: Injectable custom fetch implementation for custom transports, mocking, or caching wrappers.
  - `headers`: Global headers applied to all requests.
  - `timeoutMs`: Request timeout handling via `AbortController` and `AbortSignal`.
- **Domain Errors**: Provide clean, structured error hierarchy:
  - `KurobaError`: Base library error.
  - `KurobaHttpError`: HTTP status error (e.g., 404 Not Found, 500 Server Error) containing status code, response headers, and status text.
  - `KurobaRateLimitError`: Specialized error for rate-limiting warnings/blocks.
  - `KurobaParseError`: Error thrown when API response parsing fails.
- **API Types**: Provide exhaustive TypeScript interfaces exactly matching `4chan-API` specifications for boards and common post metadata:
  - `Board`, `BoardsResponse`, `BoardCooldowns`, `BoardFlags`.
- **First Endpoint (`client.boards.list`)**: Implement `client.boards.list(options?)` and `client.boards.raw(options?)` fetching `https://a.4cdn.org/boards.json` with support for `ifModifiedSince` date/string headers.
- **Test Infrastructure & Tests**: Introduce mock-based unit tests using Node's built-in `node:test` and `node:assert`, validating request building, custom fetch integration, status error handling, and `boards.json` payload mapping without network calls.
- **Concise Documentation**: Document client initialization, `client.boards.list()` usage in Node and browser, error handling, and configuration options.

## Capabilities

### New Capabilities
- `api-client`: Core 4chan API client structure, namespaced endpoints (`client.boards`), media helper (`client.media`), universal HTTP transport, error hierarchy, configuration options, and boards endpoint.

### Modified Capabilities
<!-- None -->

## Impact

- **Public APIs**: Exports `KurobaClient`, `createKurobaClient`, `BoardsEndpoint`, `MediaHelper`, error classes (`KurobaError`, `KurobaHttpError`, etc.), and types (`Board`, `BoardsResponse`, `KurobaClientOptions`, `RequestOptions`) from `src/index.ts`.
- **Dependencies**: No external runtime dependencies; uses standard global `fetch`.
- **Development Tooling**: Adds `test` script to `package.json` utilizing `node:test` (or `tsx`/`tsc` execution) without heavy test framework bloat.
