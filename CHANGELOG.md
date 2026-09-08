# kuroba

## 0.0.1

### Patch Changes

- Initial release of Kuroba:
  - Universal `KurobaClient` supporting both Node.js (>= 18) and modern browser runtimes with zero runtime dependencies.
  - Namespaced API structure with `client.boards.list()` and `client.media` URL helpers.
  - Strictly-typed `Board` class with lazy camelCase property getters and raw wire access (`board.raw`).
  - HTTP caching via `If-Modified-Since` (`Date`) and graceful 304 Not Modified handling.
  - Structured domain error classes (`KurobaError`, `KurobaHttpError`, `KurobaRateLimitError`, `KurobaParseError`).
  - Configurable base URLs for proxying and browser CORS support.
