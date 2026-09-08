## 1. Types and Errors

- [x] 1.1 Define 4chan board and metadata types (`Board`, `RawBoard`, `BoardCooldowns`, `BoardFlags`, `RawBoardsResponse`) in `src/types/boards.ts` matching `4chan-API`
- [x] 1.2 Define client and request options (`KurobaClientOptions`, `RequestOptions`) in `src/types/options.ts`
- [x] 1.3 Implement structured error classes (`KurobaError`, `KurobaHttpError`, `KurobaRateLimitError`, `KurobaParseError`) in `src/errors.ts`

## 2. Universal Transport and Request Handling

- [x] 2.1 Implement core request execution in `src/transport.ts` using standard `fetch` with configurable base URL and timeout handling via `AbortController`
- [x] 2.2 Implement `If-Modified-Since` date header formatting and HTTP 304 Not Modified response handling
- [x] 2.3 Implement response status validation and error classification mapping 429 to `KurobaRateLimitError`, 4xx/5xx to `KurobaHttpError`, and JSON syntax issues to `KurobaParseError`

## 3. Client Implementation and Boards Feature

- [x] 3.1 Implement `KurobaClient` class and `createKurobaClient()` factory in `src/client.ts`
- [x] 3.2 Implement `client.boards.list()` on `KurobaClient` fetching `/boards.json`
- [x] 3.3 Export public client, factory, functions, errors, and types from `src/index.ts`

## 4. Test Harness and Unit Tests

- [x] 4.1 Configure `test` script in `package.json` using Node.js built-in `node:test` runner
- [x] 4.2 Add unit tests for `KurobaClient` initialization, custom `baseUrl`, and injectable `fetch` in `test/client.test.ts`
- [x] 4.3 Add unit tests for `client.boards.list()`, `board.raw`, header passing (`If-Modified-Since`), and 304 response handling in `test/boards.test.ts`
- [x] 4.4 Add unit tests for error classes, HTTP status propagation, 429 rate limiting, and parse errors in `test/errors.test.ts`
- [x] 4.5 Execute test suite and typecheck to verify all tests pass

## 5. Documentation

- [x] 5.1 Write concise documentation in `README.md` detailing quickstart for Node.js and browser environments, browser CORS proxying, client options, and `client.boards.list()` usage
