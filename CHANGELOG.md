# kuroba

## 0.0.6

### Patch Changes

- Comprehensive JSDoc documentation across all models and endpoints with `@remarks Raw:` field mappings from official 4chan API documentation.

## 0.0.5

### Patch Changes

- Add `client.index.get(board, page?, options?)` endpoint with `IndexPage` model.

## 0.0.4

### Patch Changes

- Add `client.threads` namespace (`get` and `list`) with `Thread`, `Post`, and `ThreadListPage` models.

## 0.0.3

### Patch Changes

- Add `client.catalog.list(board, options?)` endpoint to fetch board catalogs with `CatalogPage`, `CatalogThread`, and `CatalogReply` models.

## 0.0.2

### Patch Changes

- [`e0a698b`](https://github.com/NikanZeyaei/kuroba/commit/e0a698ba764051a6e36fe0887645c3a7d4f3874f) Thanks [@NikanZeyaei](https://github.com/NikanZeyaei)! - Add `client.archive.list(board, options?)` to retrieve archived thread IDs from `/<board>/archive.json`.

## 0.0.1

### Patch Changes

- Initial release of Kuroba:
  - Universal `KurobaClient` supporting both Node.js (>= 18) and modern browser runtimes with zero runtime dependencies.
  - Namespaced API structure with `client.boards.list()` and `client.media` URL helpers.
  - Strictly-typed `Board` class with lazy camelCase property getters and raw wire access (`board.raw`).
  - HTTP caching via `If-Modified-Since` (`Date`) and graceful 304 Not Modified handling.
  - Structured domain error classes (`KurobaError`, `KurobaHttpError`, `KurobaRateLimitError`, `KurobaParseError`).
  - Configurable base URLs for proxying and browser CORS support.
